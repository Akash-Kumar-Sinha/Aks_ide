use futures_util::StreamExt;
use nix::libc;
use nix::pty::{openpty, Winsize};
use nix::sys::termios::{
    self, InputFlags, LocalFlags, OutputFlags, SetArg, SpecialCharacterIndices,
};

use std::os::unix::io::{AsRawFd, FromRawFd, RawFd};
use std::process::{Command, Stdio};
use tokio::io::AsyncReadExt;
use tokio::task;

use crate::AppState;

pub async fn pseudo_terminal(
    docker_container_id: Option<String>,
    state: AppState,
    email: String,
) -> Result<(), std::io::Error> {

    let winsize = Winsize {
        ws_row: 24,
        ws_col: 80,
        ws_xpixel: 0,
        ws_ypixel: 0,
    };


    let pty = openpty(Some(&winsize), None).map_err(|e| {
        println!("Failed to open PTY: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

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


    termios::tcsetattr(pty.slave, SetArg::TCSANOW, &termios).map_err(|e| {
        println!("Failed to set termios: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;


    let container_id = docker_container_id.unwrap_or_else(|| "default-container".to_string());

    let docker_ps = Command::new("docker")
        .args(["ps", "-q", "--filter", &format!("id={}", container_id)])
        .output();

    match docker_ps {
        Ok(output) => {
            if output.stdout.is_empty() {
                println!(
                    " Warning: Container {} doesn't appear to be running",
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

    let master_fd = pty.master;
    let slave_fd = pty.slave;


    let master = unsafe { std::fs::File::from_raw_fd(libc::dup(master_fd)) };

    {
        let mut terminal_guard = state.terminal_mapping.lock().unwrap();
        terminal_guard.insert(
            email.clone(),
            Some(master.try_clone().expect("Failed to clone master file")),
        );
    }

    let shell_command = "/bin/bash";


    let mut docker_command = Command::new("docker");
    docker_command
        .arg("exec")
        .arg("-it")
        .arg(&container_id)
        .arg(shell_command)
        .stdin(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stdout(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stderr(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) });


    let _child = match docker_command.spawn() {
        Ok(child) => {
            child
        }
        Err(e) => {
            state
                .socket_io
                .emit(
                    "terminal_error",
                    &format!("Failed to start docker exec: {}", e),
                )
                .await
                .ok();
            return Err(e);
        }
    };

    state
        .socket_io
        .emit("terminal_success", "Terminal created successfully")
        .await
        .ok();

    let socket_io = state.socket_io.clone();
    let master_clone = master.try_clone().expect("Failed to clone master file");

    task::spawn(async move {
        let mut buffer = [0u8; 1024];
        let mut reader = tokio::fs::File::from_std(master_clone);

        loop {
            match reader.read(&mut buffer).await {
                Ok(n) if n > 0 => {
                    if let Ok(text) = std::str::from_utf8(&buffer[0..n]) {
                       
                        socket_io.emit("terminal_data", text).await.ok();
                    } else {
                        let hex_data = buffer[0..n]
                            .iter()
                            .map(|b| format!("\\x{:02x}", b))
                            .collect::<Vec<String>>()
                            .join("");
                        println!("Received binary data: {}", hex_data);
                    }
                }
                Ok(0) => {
                    socket_io
                        .emit("terminal_closed", "Terminal session ended")
                        .await
                        .ok();
                    break;
                }
                Ok(_) => {
                    continue;
                }
                Err(e) => {
                    socket_io
                        .emit("terminal_error", &format!("Terminal read error: {}", e))
                        .await
                        .ok();
                    break;
                }
            }
        }
    });

    Ok(())
}
