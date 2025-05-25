use nix::libc;
use nix::pty::{openpty, Winsize};
use nix::sys::termios::{
    self, InputFlags, LocalFlags, OutputFlags, SetArg, SpecialCharacterIndices,
};
use socketioxide::extract::SocketRef;

use std::os::unix::io::FromRawFd;
use std::process::{Command, Stdio};
use tokio::io::AsyncReadExt;
use tokio::task;

use crate::AppState;

pub async fn pseudo_terminal(
    s: &SocketRef,
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

    println!(
        "Created PTY: master={} slave={} name={}",
        pty.master, pty.slave, slave_name
    );

    let mut termios = termios::tcgetattr(pty.slave).map_err(|e| {
        println!("Failed to get termios: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

    termios.input_flags.remove(
        InputFlags::ICRNL
            | InputFlags::IXON
            | InputFlags::ISTRIP
            | InputFlags::IGNCR
            | InputFlags::INLCR,
    );
    termios.output_flags.remove(OutputFlags::OPOST);
    termios
        .local_flags
        .remove(LocalFlags::ECHO | LocalFlags::ICANON | LocalFlags::ISIG | LocalFlags::IEXTEN);

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
                    "Warning: Container {} doesn't appear to be running",
                    container_id
                );
            } else {
                println!("Container {} is running", container_id);
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
        .env("TERM", "xterm-256color")
        .env("COLORTERM", "truecolor")
        .env("LC_ALL", "C.UTF-8")
        .arg(shell_command)
        .stdin(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stdout(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stderr(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) });

    let mut child = match docker_command.spawn() {
        Ok(child) => {
            println!("Docker exec process started successfully");
            child
        }
        Err(e) => {
            println!("Failed to start docker exec: {}", e);
            s.emit(
                "terminal_error",
                &format!("Failed to start docker exec: {}", e),
            )
            .ok();
            return Err(e);
        }
    };

    s.emit("terminal_success", "Terminal created successfully")
        .ok();

    let socket_clone = s.clone();
    let email_clone = email.clone();
    let master_clone = master.try_clone().expect("Failed to clone master file");

    let _read_task = task::spawn(async move {
        let mut buffer = [0u8; 4096];
        let mut reader = tokio::fs::File::from_std(master_clone);

        loop {
            match reader.read(&mut buffer).await {
                Ok(0) => {
                    println!("Terminal session ended for {}", email_clone);
                    socket_clone
                        .emit("terminal_closed", "Terminal session ended")
                        .ok();
                    break;
                }
                Ok(n) => {
                    if let Ok(text) = std::str::from_utf8(&buffer[0..n]) {
                        socket_clone.emit("terminal_data", text).ok();
                    } else {
                        let mut valid_end = n;
                        while valid_end > 0 {
                            if let Ok(text) = std::str::from_utf8(&buffer[0..valid_end]) {
                                socket_clone.emit("terminal_data", text).ok();
                                break;
                            }
                            valid_end -= 1;
                        }

                        if valid_end == 0 {
                            let hex_data = buffer[0..n]
                                .iter()
                                .map(|b| format!("\\x{:02x}", b))
                                .collect::<Vec<String>>()
                                .join("");
                            println!("Received binary data for {}: {}", email_clone, hex_data);
                        }
                    }
                }
                Err(e) => {
                    println!("Terminal read error for {}: {}", email_clone, e);
                    socket_clone
                        .emit("terminal_error", &format!("Terminal read error: {}", e))
                        .ok();
                    break;
                }
            }
        }
    });

    let socket_clone2 = s.clone();
    let email_clone2 = email.clone();
    let state_clone = state.clone();

    task::spawn(async move {
        let exit_status = child.wait();

        match exit_status {
            Ok(status) => {
                println!(
                    "Docker process exited with status: {} for {}",
                    status, email_clone2
                );
            }
            Err(e) => {
                println!(
                    "Error waiting for docker process for {}: {}",
                    email_clone2, e
                );
            }
        }

        {
            let mut terminal_guard = state_clone.terminal_mapping.lock().unwrap();
            terminal_guard.remove(&email_clone2);
        }

        socket_clone2
            .emit("terminal_closed", "Docker process terminated")
            .ok();
    });

    Ok(())
}
