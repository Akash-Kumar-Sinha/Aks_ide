use futures_util::StreamExt;
use nix::libc;
use nix::pty::{openpty, Winsize};
use nix::sys::termios::{
    self, InputFlags, LocalFlags, OutputFlags, SetArg, SpecialCharacterIndices,
};
use socketioxide::SocketIo;
use std::fs::File;
use std::io::{Read, Write};
use std::os::fd::IntoRawFd;
use std::os::unix::io::{AsRawFd, FromRawFd, RawFd};
use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::select;
use tokio::sync::mpsc;
use tokio::task;

use crate::AppState;

// Improved pseudo_terminal function with better error handling and bidirectional communication
pub async fn pseudo_terminal(
    docker_container_id: Option<String>,
    state: AppState,
) -> Result<(), std::io::Error> {
    println!("Starting pseudo_terminal function");

    // Create a new PTY with custom window size
    let winsize = Winsize {
        ws_row: 24,
        ws_col: 80,
        ws_xpixel: 0,
        ws_ypixel: 0,
    };

    println!(
        "Creating PTY with winsize: {}x{}",
        winsize.ws_row, winsize.ws_col
    );

    let pty = openpty(Some(&winsize), None).map_err(|e| {
        println!("Failed to open PTY: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

    // Get PTY name for logging
    let slave_name = unsafe {
        let name_ptr = libc::ptsname(pty.master);
        if name_ptr.is_null() {
            println!("Could not get slave PTY name");
            String::from("unknown")
        } else {
            std::ffi::CStr::from_ptr(name_ptr)
                .to_string_lossy()
                .into_owned()
        }
    };

    println!("Slave PTY path: {}", slave_name);

    // Configure terminal settings
    println!("Getting current termios attributes");
    let mut termios = termios::tcgetattr(pty.slave).map_err(|e| {
        println!("Failed to get termios: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;
    
    // Configure terminal for raw mode
    termios.input_flags.remove(InputFlags::ICRNL);
    termios.output_flags.remove(OutputFlags::OPOST);
    termios.local_flags.remove(LocalFlags::ECHO);
    termios.local_flags.remove(LocalFlags::ICANON);
    termios.local_flags.remove(LocalFlags::ISIG);
    termios.local_flags.remove(LocalFlags::IEXTEN);
    termios.control_chars[SpecialCharacterIndices::VMIN as usize] = 1;
    termios.control_chars[SpecialCharacterIndices::VTIME as usize] = 0;

    println!(
        "New termios: input_flags={:?}, output_flags={:?}, local_flags={:?}",
        termios.input_flags, termios.output_flags, termios.local_flags
    );

    termios::tcsetattr(pty.slave, SetArg::TCSANOW, &termios).map_err(|e| {
        println!("Failed to set termios: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

    println!("✅ Terminal configured in raw mode");

    // Get the container ID or use a default
    let container_id = docker_container_id.unwrap_or_else(|| "default-container".to_string());
    println!("Using docker container ID: {}", container_id);

    // Check if container exists and is running
    println!("Checking if container exists and is running");
    let docker_ps = Command::new("docker")
        .args(["ps", "-q", "--filter", &format!("id={}", container_id)])
        .output();

    match docker_ps {
        Ok(output) => {
            if output.stdout.is_empty() {
                println!(
                    "⚠️  Warning: Container {} doesn't appear to be running",
                    container_id
                );
            } else {
                println!("Container is running");
            }
        }
        Err(e) => {
            println!("Error checking container status: {}", e);
        }
    }

    // IMPORTANT: Create duplicates of the file descriptors to prevent them from being closed
    let master_fd = pty.master;
    let slave_fd = pty.slave;
    
    // Convert file descriptors to Rust file objects
    println!(
        "Converting file descriptors: master={}, slave={}",
        master_fd, slave_fd
    );
    
    // SAFETY: These file descriptors are valid as they were just created by openpty()
    // Use duplicated FDs for the File objects
    let mut master = unsafe { std::fs::File::from_raw_fd(libc::dup(master_fd)) };
    
    // Store the master in the global AppState
    {
        let mut terminal_guard = state.terminal.lock().unwrap();
        *terminal_guard = Some(master.try_clone().expect("Failed to clone master file"));
    }
    println!("✅ Terminal master stored in global AppState");

    // Spawn docker exec command, connecting to the slave side of our PTY
    let shell_command = "/bin/bash";
    println!("Preparing docker exec command with shell: {}", shell_command);

    // Create duplicates of the slave FD for each stdio stream
    let mut docker_command = Command::new("docker");
    docker_command
        .arg("exec")
        .arg("-it")
        .arg(&container_id)
        .arg(shell_command)
        .stdin(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stdout(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stderr(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) });

    println!("Docker command: {:?}", docker_command);

    // Spawn the docker exec command
    println!("⏳ Starting docker exec for container {}", container_id);
    let child = match docker_command.spawn() {
        Ok(child) => {
            println!("Docker exec spawned successfully with PID: {}", child.id());
            child
        }
        Err(e) => {
            println!("Failed to spawn docker exec: {}", e);
            state.socket_io.emit("terminal_error", &format!("Failed to start docker exec: {}", e)).await.ok();
            return Err(e);
        }
    };

    // Notify the frontend that terminal is ready
    state.socket_io.emit("terminal_success", "Terminal created successfully").await.ok();
    
    // Set up continuous terminal output reading in a separate task
    let socket_io = state.socket_io.clone();
    let master_clone = master.try_clone().expect("Failed to clone master file");
    
    // Start a background task for reading from the terminal
    task::spawn(async move {
        let mut buffer = [0u8; 1024];
        let mut reader = tokio::fs::File::from_std(master_clone);
        
        loop {
            match reader.read(&mut buffer).await {
                Ok(n) if n > 0 => {
                    if let Ok(text) = std::str::from_utf8(&buffer[0..n]) {
                        println!("Terminal output: {}", text.replace("\r", "\\r").replace("\n", "\\n"));
                        socket_io.emit("terminal_data", text).await.ok();
                    } else {
                        // Handle non-UTF8 data by sending raw bytes
                        let hex_data = buffer[0..n].iter()
                            .map(|b| format!("\\x{:02x}", b))
                            .collect::<Vec<String>>()
                            .join("");
                        println!("Received binary data: {}", hex_data);
                        // We could send this as binary data if needed
                    }
                },
                Ok(0) => {
                    println!("Terminal EOF - closing terminal");
                    socket_io.emit("terminal_closed", "Terminal session ended").await.ok();
                    break;
                },
                // Handle all other positive values (should not happen, but needed for exhaustiveness)
                Ok(_) => {
                    // This branch should never be reached since we handle all n > 0 above
                    // but this ensures all Ok(usize) cases are covered
                    println!("Unexpected read result (this should never happen)");
                    continue;
                },
                Err(e) => {
                    println!("Error reading from terminal: {}", e);
                    socket_io.emit("terminal_error", &format!("Terminal read error: {}", e)).await.ok();
                    break;
                },
            }
        }
    });

    // Return success to indicate terminal is set up
    Ok(())
}

// Function to write to the terminal from the frontend
pub fn write_to_terminal(state: &AppState, data: &str) -> Result<(), std::io::Error> {
    let terminal_guard = state.terminal.lock().unwrap();
    
    match &*terminal_guard {
        Some(terminal) => {
            // Clone the terminal file handle to avoid borrowing issues
            let mut terminal_clone = terminal.try_clone()?;
            
            // Drop the lock to avoid potential deadlock
            drop(terminal_guard);
            
            // Debug: Print what's being written, escaping special characters
            let debug_data = data.replace("\r", "\\r").replace("\n", "\\n");
            println!("Writing to terminal: {}", debug_data);
            
            // Write the data to the terminal
            terminal_clone.write_all(data.as_bytes())?;
            terminal_clone.flush()?;
            
            Ok(())
        },
        None => {
            println!("Terminal not initialized");
            Err(std::io::Error::new(
                std::io::ErrorKind::NotConnected,
                "Terminal not initialized"
            ))
        }
    }
}

// Function to close the terminal
pub fn close_terminal(state: &AppState) -> Result<(), std::io::Error> {
    let mut terminal_guard = state.terminal.lock().unwrap();

    if let Some(_) = &*terminal_guard {
        // Reset the terminal in AppState to None
        *terminal_guard = None;
        println!("Terminal closed and removed from global state");
        Ok(())
    } else {
        println!("Terminal already closed");
        Ok(())
    }
}