use nix::libc;
use nix::pty::{openpty, Winsize};
use nix::sys::termios::{
    self, InputFlags, LocalFlags, OutputFlags, SetArg, SpecialCharacterIndices,
};
use regex::Regex;
use socketioxide::extract::SocketRef;

use std::fs::File;
use std::os::unix::io::FromRawFd;
use std::process::{Command, Stdio};
use tokio::io::AsyncReadExt;
use tokio::task;

use crate::{
    events,
    state::{terminal_key, AppState},
    types::{TerminalDataPayload, TerminalStatusPayload},
};

fn configure_pty(slave_fd: i32) -> Result<(), std::io::Error> {
    let mut termios = termios::tcgetattr(slave_fd)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

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

    termios::tcsetattr(slave_fd, SetArg::TCSANOW, &termios)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))
}

fn spawn_docker_shell(container_id: &str, slave_fd: i32) -> Result<std::process::Child, std::io::Error> {
    Command::new("docker")
        .arg("exec")
        .arg("-it")
        .arg(container_id)
        .env("TERM", "xterm-256color")
        .env("COLORTERM", "truecolor")
        .env("LC_ALL", "C.UTF-8")
        .arg("/bin/bash")
        .stdin(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stdout(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stderr(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .spawn()
}

pub async fn pseudo_terminal(
    s: &SocketRef,
    docker_container_id: Option<String>,
    state: AppState,
    email: String,
    terminal_id: String,
) -> Result<(), std::io::Error> {
    let winsize = Winsize { ws_row: 24, ws_col: 80, ws_xpixel: 0, ws_ypixel: 0 };

    let pty = openpty(Some(&winsize), None)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    configure_pty(pty.slave)?;

    let container_id = docker_container_id.unwrap_or_else(|| "default-container".to_string());
    let key = terminal_key(&email, &terminal_id);

    let master = unsafe { File::from_raw_fd(libc::dup(pty.master)) };
    state.terminal_mapping.insert(key.clone(), master.try_clone()?);

    let mut child = match spawn_docker_shell(&container_id, pty.slave) {
        Ok(c) => c,
        Err(e) => {
            s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload {
                terminal_id: terminal_id.clone(),
                message: format!("Failed to start docker exec: {}", e),
            })
            .ok();
            return Err(e);
        }
    };

    s.emit(events::outgoing::TERMINAL_SUCCESS, &TerminalStatusPayload {
        terminal_id: terminal_id.clone(),
        message: "Terminal created successfully".to_string(),
    })
    .ok();

    let socket_read = s.clone();
    let tid_read = terminal_id.clone();
    let email_read = email.clone();
    let master_read = master.try_clone()?;

    task::spawn(async move {
        let mut buf = [0u8; 4096];
        let mut reader = tokio::fs::File::from_std(master_read);
        let ansi_re = Regex::new(r"\x1b\[[0-9;]*[mGKHFJl]|\x1b\][^\x07]*\x07").unwrap();
        let prompt_re = Regex::new(r"@[^:]+:([^#\$%\r\n]+)[#\$%]").unwrap();

        loop {
            match reader.read(&mut buf).await {
                Ok(0) => {
                    socket_read
                        .emit(events::outgoing::TERMINAL_CLOSED, &TerminalStatusPayload {
                            terminal_id: tid_read.clone(),
                            message: "Terminal session ended".to_string(),
                        })
                        .ok();
                    break;
                }
                Ok(n) => {
                    let text = match std::str::from_utf8(&buf[..n]) {
                        Ok(t) => t.to_string(),
                        Err(_) => {
                            let mut end = n;
                            while end > 0 {
                                if std::str::from_utf8(&buf[..end]).is_ok() {
                                    break;
                                }
                                end -= 1;
                            }
                            if end == 0 { continue; }
                            std::str::from_utf8(&buf[..end]).unwrap().to_string()
                        }
                    };

                    socket_read
                        .emit(events::outgoing::TERMINAL_DATA, &TerminalDataPayload {
                            terminal_id: tid_read.clone(),
                            data: text.clone(),
                        })
                        .ok();

                    let clean = ansi_re.replace_all(&text, "");
                    if let Some(caps) = prompt_re.captures(&clean) {
                        let cwd = caps[1].trim().to_string();
                        if !cwd.is_empty() {
                            socket_read.emit(events::outgoing::TERMINAL_CWD, &cwd).ok();
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Terminal read error for {}:{}: {}", email_read, tid_read, e);
                    socket_read
                        .emit("terminal_error", &TerminalStatusPayload {
                            terminal_id: tid_read.clone(),
                            message: format!("Terminal read error: {}", e),
                        })
                        .ok();
                    break;
                }
            }
        }
    });

    let socket_exit = s.clone();
    let tid_exit = terminal_id.clone();
    let state_exit = state.clone();
    let key_exit = key.clone();

    task::spawn(async move {
        let status = task::spawn_blocking(move || child.wait()).await;
        match status {
            Ok(Ok(s)) => println!("Docker process exited: {} for key={}", s, key_exit),
            Ok(Err(e)) => eprintln!("Error waiting for docker process key={}: {}", key_exit, e),
            Err(e) => eprintln!("spawn_blocking join error key={}: {}", key_exit, e),
        }
        state_exit.terminal_mapping.remove(&key_exit);
        socket_exit
            .emit(events::outgoing::TERMINAL_CLOSED, &TerminalStatusPayload {
                terminal_id: tid_exit,
                message: "Docker process terminated".to_string(),
            })
            .ok();
    });

    pseudo_back_terminal(state, email, terminal_id).await?;

    Ok(())
}

pub async fn pseudo_back_terminal(
    state: AppState,
    email: String,
    terminal_id: String,
) -> Result<(), std::io::Error> {
    let winsize = Winsize { ws_row: 24, ws_col: 80, ws_xpixel: 0, ws_ypixel: 0 };

    let container_id = state
        .docker_container_id
        .get(&email)
        .map(|r| r.clone())
        .ok_or_else(|| {
            std::io::Error::new(
                std::io::ErrorKind::NotFound,
                format!("Docker container not found for email: {}", email),
            )
        })?;

    let pty = openpty(Some(&winsize), None)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))?;

    configure_pty(pty.slave)?;

    match spawn_docker_shell(&container_id, pty.slave) {
        Ok(_) => println!("Back terminal started for {}:{}", email, terminal_id),
        Err(e) => {
            eprintln!("Failed to spawn back terminal for {}: {}", email, e);
            return Err(e);
        }
    }

    let master = unsafe { File::from_raw_fd(libc::dup(pty.master)) };
    state.back_terminal_mapping.insert(email, master);

    Ok(())
}
