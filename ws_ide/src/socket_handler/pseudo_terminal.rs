use std::io::{Read, Write};
use std::os::fd::IntoRawFd;
use std::os::unix::io::{AsRawFd, FromRawFd, RawFd};
use std::process::{Command, Stdio};
use std::fs::File;
use futures_util::StreamExt;
use nix::libc;
use nix::pty::{openpty, Winsize};
use nix::sys::termios::{
    self, InputFlags, LocalFlags, OutputFlags, SetArg, SpecialCharacterIndices,
};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::select;

// For debug printing
use std::env;
use std::time::{SystemTime, UNIX_EPOCH};

use crate::AppState;

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

    if pty.master != -1 {
        state
            .socket_io
            .emit("terminal_success", "Terminal created successfully")
            .await
            .ok();
    }

    // Get PTY name
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

    println!("   - Slave path: {}", slave_name);

    println!("Slave PTY path: {}", slave_name);

    // Configure terminal settings
    println!("Getting current termios attributes");
    let mut termios = termios::tcgetattr(pty.slave).map_err(|e| {
        println!("Failed to get termios: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;
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
    let container_id = docker_container_id.unwrap_or_else(|| "your-container-id".to_string());
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
                println!("Container not found in docker ps output");
            } else {
                println!("Container is running");
            }
        }
        Err(e) => {
            println!("Error checking container status: {}", e);
            println!("⚠️  Warning: Failed to verify container status: {}", e);
        }
    }

    // Safely convert file descriptors to Rust file objects
    println!(
        "Converting file descriptors: master={}, slave={}",
        pty.master, pty.slave
    );
    // SAFETY: These file descriptors are valid as they were just created by openpty()
    let mut master = unsafe { std::fs::File::from_raw_fd(pty.master) };
    let slave_fd = pty.slave;


    // Spawn docker exec command, connecting to the slave side of our PTY
    let shell_command = "/bin/bash"; // Default shell, can be configurable
    println!(
        "Preparing docker exec command with shell: {}",
        shell_command
    );

    let mut docker_command = Command::new("docker");
    docker_command
        .arg("exec")
        .arg("-it")
        .arg(&container_id)
        .arg(shell_command)
        .stdin(unsafe { Stdio::from_raw_fd(slave_fd) })
        .stdout(unsafe { Stdio::from_raw_fd(slave_fd) })
        .stderr(unsafe { Stdio::from_raw_fd(slave_fd) });

    println!("Docker command: {:?}", docker_command);

    // Spawn the docker exec command
    println!("⏳ Starting docker exec for container {}", container_id);
    let child = match docker_command.spawn() {
        Ok(child) => {
            println!("Docker exec spawned successfully with PID: {}", child.id());
            println!("✅ Docker exec started with PID: {}", child.id());
            child
        }
        Err(e) => {
            println!("Failed to spawn docker exec: {}", e);
            println!("❌ Failed to start docker exec: {}", e);
            return Err(e);
        }
    };

    // Create tokio channels for communication
    println!("Setting up communication channels");
    let (tx, mut rx) = tokio::sync::mpsc::channel::<Vec<u8>>(100);
    let (input_tx, mut input_rx) = tokio::sync::mpsc::channel::<Vec<u8>>(100);

 // Create a buffer to store terminal output
    let mut buffer = [0u8; 1024];
    let socket = state.socket_io.clone();       

    // Read in a continuous loop
    loop {
        // Read from the terminal (PTY master)
        match master.read(&mut buffer) {
            Ok(n) if n > 0 => {
                // Convert bytes to string and print
                if let Ok(text) = std::str::from_utf8(&buffer[0..n]) {
                    println!("Terminal output: {}", text);
                    socket.emit("terminal_data", text).await.ok();
                } else {
                    // Handle non-UTF8 data
                    println!("Received {} bytes of binary data", n);
                }
            }
            Ok(0) => {
                // End of file - terminal closed
                println!("Terminal connection closed");
                break;
            }
            Err(e) => {
                // Handle error
                println!("Error reading from terminal: {}", e);
                break;
            }
            _ => {
                // Handle unexpected result
                println!("Unexpected read result from terminal");
                break;
            }                           
        }
    }


    Ok(())
}
