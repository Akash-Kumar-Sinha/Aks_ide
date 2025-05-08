use std::io::{Read, Write};
use std::os::fd::IntoRawFd;
use std::os::unix::io::{AsRawFd, FromRawFd, RawFd};
use std::process::{Command, Stdio};

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

/// Helper function to get current timestamp for debug logs
fn debug_timestamp() -> String {
    let start = SystemTime::now();
    let since_epoch = start.duration_since(UNIX_EPOCH).unwrap();
    format!(
        "{}.{:03}",
        since_epoch.as_secs(),
        since_epoch.subsec_millis()
    )
}

/// Helper function for debug prints
fn debug_print(message: &str) {
    if env::var("DEBUG").unwrap_or_default() == "1" {
        eprintln!("[{}] DEBUG: {}", debug_timestamp(), message);
    }
}

/// Sets up a pseudo terminal (PTY) and connects it to a Docker container
pub async fn pseudo_terminal(
    docker_container_id: Option<String>,
    state: AppState,
) -> Result<(), std::io::Error> {
    debug_print("Starting pseudo_terminal function");

    // Create a new PTY with custom window size
    let winsize = Winsize {
        ws_row: 24,
        ws_col: 80,
        ws_xpixel: 0,
        ws_ypixel: 0,
    };

    debug_print(&format!(
        "Creating PTY with winsize: {}x{}",
        winsize.ws_row, winsize.ws_col
    ));

    let pty = openpty(Some(&winsize), None).map_err(|e| {
        debug_print(&format!("Failed to open PTY: {}", e));
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

    println!("✅ PTY Created successfully:");
    println!("   - Master FD: {}", pty.master);
    println!("   - Slave FD:  {}", pty.slave);
    println!(
        "   - Size:      {}x{} characters",
        winsize.ws_row, winsize.ws_col
    );
    if pty.master != -1 {
        state
            .socket_io
            .emit("terminal_success", "Terminal created successfully")
            .await.ok();
    }

    // Get PTY name
    let slave_name = unsafe {
        let name_ptr = libc::ptsname(pty.master);
        if name_ptr.is_null() {
            debug_print("Could not get slave PTY name");
            String::from("unknown")
        } else {
            std::ffi::CStr::from_ptr(name_ptr)
                .to_string_lossy()
                .into_owned()
        }
    };

    println!("   - Slave path: {}", slave_name);

    debug_print(&format!("Slave PTY path: {}", slave_name));

    // Configure terminal settings
    debug_print("Getting current termios attributes");
    let mut termios = termios::tcgetattr(pty.slave).map_err(|e| {
        debug_print(&format!("Failed to get termios: {}", e));
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

    // Print current terminal settings
    debug_print(&format!(
        "Current termios: input_flags={:?}, output_flags={:?}, local_flags={:?}",
        termios.input_flags, termios.output_flags, termios.local_flags
    ));

    // Set raw mode for the terminal
    debug_print("Setting terminal to raw mode");
    termios.input_flags.remove(InputFlags::ICRNL);
    termios.output_flags.remove(OutputFlags::OPOST);
    termios.local_flags.remove(LocalFlags::ECHO);
    termios.local_flags.remove(LocalFlags::ICANON);
    termios.local_flags.remove(LocalFlags::ISIG);
    termios.local_flags.remove(LocalFlags::IEXTEN);
    termios.control_chars[SpecialCharacterIndices::VMIN as usize] = 1;
    termios.control_chars[SpecialCharacterIndices::VTIME as usize] = 0;

    debug_print(&format!(
        "New termios: input_flags={:?}, output_flags={:?}, local_flags={:?}",
        termios.input_flags, termios.output_flags, termios.local_flags
    ));

    termios::tcsetattr(pty.slave, SetArg::TCSANOW, &termios).map_err(|e| {
        debug_print(&format!("Failed to set termios: {}", e));
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

    println!("✅ Terminal configured in raw mode");

    // Get the container ID or use a default
    let container_id = docker_container_id.unwrap_or_else(|| "your-container-id".to_string());
    debug_print(&format!("Using docker container ID: {}", container_id));

    // Check if container exists and is running
    debug_print("Checking if container exists and is running");
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
                debug_print("Container not found in docker ps output");
            } else {
                debug_print("Container is running");
            }
        }
        Err(e) => {
            debug_print(&format!("Error checking container status: {}", e));
            println!("⚠️  Warning: Failed to verify container status: {}", e);
        }
    }

    // Safely convert file descriptors to Rust file objects
    debug_print(&format!(
        "Converting file descriptors: master={}, slave={}",
        pty.master, pty.slave
    ));
    // SAFETY: These file descriptors are valid as they were just created by openpty()
    let mut master = unsafe { std::fs::File::from_raw_fd(pty.master) };
    let slave_fd = pty.slave;

    // Spawn docker exec command, connecting to the slave side of our PTY
    let shell_command = "/bin/bash"; // Default shell, can be configurable
    debug_print(&format!(
        "Preparing docker exec command with shell: {}",
        shell_command
    ));

    let mut docker_command = Command::new("docker");
    docker_command
        .arg("exec")
        .arg("-it")
        .arg(&container_id)
        .arg(shell_command)
        .stdin(unsafe { Stdio::from_raw_fd(slave_fd) })
        .stdout(unsafe { Stdio::from_raw_fd(slave_fd) })
        .stderr(unsafe { Stdio::from_raw_fd(slave_fd) });

    debug_print(&format!("Docker command: {:?}", docker_command));

    // Spawn the docker exec command
    println!("⏳ Starting docker exec for container {}", container_id);
    let child = match docker_command.spawn() {
        Ok(child) => {
            debug_print(&format!(
                "Docker exec spawned successfully with PID: {}",
                child.id()
            ));
            println!("✅ Docker exec started with PID: {}", child.id());
            child
        }
        Err(e) => {
            debug_print(&format!("Failed to spawn docker exec: {}", e));
            println!("❌ Failed to start docker exec: {}", e);
            return Err(e);
        }
    };

    // Create tokio channels for communication
    debug_print("Setting up communication channels");
    let (tx, mut rx) = tokio::sync::mpsc::channel::<Vec<u8>>(100);
    let (input_tx, mut input_rx) = tokio::sync::mpsc::channel::<Vec<u8>>(100);

    println!("✅ Communication channels established");

    // Print detailed PTY information
    println!("\n📋 Terminal Details:");
    println!("   - Type:         Pseudo Terminal (PTY)");
    println!("   - Master FD:    {}", pty.master);
    println!("   - Slave FD:     {}", pty.slave);
    println!("   - Terminal Size: {}x{}", winsize.ws_row, winsize.ws_col);
    println!("   - Connected to:  Docker container '{}'", container_id);
    println!("   - Shell:         {}", shell_command);
    println!("   - Mode:          Raw (non-canonical)");
    println!("   - Buffer Size:   1024 bytes");

    // Spawn a task to read from the PTY master and send to TX channel
    debug_print("Spawning task to read from PTY master");
    let master_fd = master.as_raw_fd();
    tokio::spawn(async move {
        debug_print("PTY master read task started");
        let mut buffer = [0u8; 1024];
        let mut bytes_read_total = 0;

        loop {
            match tokio::task::spawn_blocking(move || {
                let mut tmp_master = unsafe { std::fs::File::from_raw_fd(master_fd) };
                let result = tmp_master.read(&mut buffer);
                // Don't close the file descriptor
                let _ = tmp_master.into_raw_fd();
                result
            })
            .await
            {
                Ok(Ok(n)) if n > 0 => {
                    bytes_read_total += n;
                    debug_print(&format!(
                        "Read {} bytes from PTY master (total: {})",
                        n, bytes_read_total
                    ));
                    if let Err(e) = tx.send(buffer[0..n].to_vec()).await {
                        debug_print(&format!("Failed to send data to channel: {}", e));
                        break;
                    }
                }
                Ok(Ok(1_usize..)) => {
                    debug_print("Read a single byte or more from PTY master");
                }
                Ok(Ok(0)) => {
                    debug_print("End of file on PTY master");
                    break;
                }
                Ok(Err(e)) => {
                    debug_print(&format!("Error reading from PTY master: {}", e));
                    break;
                }
                Err(e) => {
                    debug_print(&format!("Task error: {}", e));
                    break;
                }
            }
        }
        debug_print("PTY master read task ended");
    });

    // Spawn a task to write to the PTY master
    debug_print("Spawning task to write to PTY master");
    let master_fd = master.as_raw_fd();
    tokio::spawn(async move {
        debug_print("PTY master write task started");
        let mut bytes_written_total = 0;

        while let Some(data) = input_rx.recv().await {
            debug_print(&format!(
                "Received {} bytes to write to PTY master",
                data.len()
            ));
            let data_clone = data.clone();
            match tokio::task::spawn_blocking(move || {
                let mut tmp_master = unsafe { std::fs::File::from_raw_fd(master_fd) };
                let result = tmp_master.write_all(&data_clone);
                // Don't close the file descriptor
                let _ = tmp_master.into_raw_fd();
                result
            })
            .await
            {
                Ok(Ok(())) => {
                    bytes_written_total += data.len();
                    debug_print(&format!(
                        "Wrote {} bytes to PTY master (total: {})",
                        data.len(),
                        bytes_written_total
                    ));
                }
                Ok(Err(e)) => {
                    debug_print(&format!("Error writing to PTY master: {}", e));
                }
                Err(e) => {
                    debug_print(&format!("Task error: {}", e));
                }
            }
        }
        debug_print("PTY master write task ended");
    });

    // Spawn a task to handle standard input
    debug_print("Spawning task to read from stdin");
    let input_tx_clone = input_tx.clone();
    tokio::spawn(async move {
        debug_print("Stdin read task started");
        let mut stdin = tokio::io::stdin();
        let mut buffer = [0u8; 1024];
        let mut bytes_read_total = 0;

        loop {
            match stdin.read(&mut buffer).await {
                Ok(n) if n > 0 => {
                    bytes_read_total += n;
                    debug_print(&format!(
                        "Read {} bytes from stdin (total: {})",
                        n, bytes_read_total
                    ));
                    if let Err(e) = input_tx_clone.send(buffer[0..n].to_vec()).await {
                        debug_print(&format!("Failed to send stdin data to channel: {}", e));
                        break;
                    }
                }
                Ok(0) => {
                    debug_print("End of file on stdin");
                    break;
                }
                Ok(n) => {
                    debug_print(&format!("Unexpected read result from stdin: {}", n));
                    break;
                }
                Err(e) => {
                    debug_print(&format!("Error reading from stdin: {}", e));
                    break;
                }
            }
        }
        debug_print("Stdin read task ended");
    });

    println!("\n✅ Terminal ready - press Ctrl+D to exit");

    // Main loop: receive data from PTY and write to stdout
    debug_print("Starting main event loop");
    let mut stdout = tokio::io::stdout();
    let mut bytes_displayed = 0;

    while let Some(data) = rx.recv().await {
        debug_print(&format!(
            "Received {} bytes from PTY to display",
            data.len()
        ));
        match stdout.write_all(&data).await {
            Ok(()) => {
                bytes_displayed += data.len();
                debug_print(&format!(
                    "Wrote {} bytes to stdout (total: {})",
                    data.len(),
                    bytes_displayed
                ));

                if let Err(e) = stdout.flush().await {
                    debug_print(&format!("Error flushing stdout: {}", e));
                    break;
                }
            }
            Err(e) => {
                debug_print(&format!("Error writing to stdout: {}", e));
                break;
            }
        }
    }

    // Cleanup and exit
    debug_print("Main event loop ended, cleaning up");
    println!("\n✅ Pseudo terminal session ended");

    // Print session statistics
    println!("\n📊 Session Statistics:");
    println!("   - Bytes displayed: {}", bytes_displayed);
    println!(
        "   - Session duration: {} seconds",
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
            - debug_timestamp()
                .split('.')
                .next()
                .unwrap_or("0")
                .parse::<u64>()
                .unwrap_or(0)
    );

    Ok(())
}
