use crate::{
    AppState, CloseTerminalPayload, LoadTerminalPayload, TerminalInputPayload,
    TerminalResizePayload,
};
use nix::libc;
use nix::pty::Winsize;
use std::io::Write;
use std::os::unix::io::AsRawFd;

pub async fn handle_terminal_input(
    state: AppState,
    data: TerminalInputPayload,
) -> Result<(), std::io::Error> {
    let socket_id = state
        .email_mapping
        .lock()
        .unwrap()
        .get(&data.email)
        .cloned();

    if socket_id.is_none() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Socket ID not found in mapping",
        ));
    }

    let email = data.email.clone();
    let input_data = data.data;

    let mut terminal_file_opt = None;
    {
        let terminal_mapping = state.terminal_mapping.lock().unwrap();
        if let Some(Some(file)) = terminal_mapping.get(&email) {
            terminal_file_opt = Some(file.try_clone()?);
        }
    }

    if let Some(mut terminal_file) = terminal_file_opt {
        match terminal_file.write_all(input_data.as_bytes()) {
            Ok(_) => {
                if let Err(e) = terminal_file.flush() {
                    println!("Error flushing terminal: {}", e);
                    if let Some(socket_id) = socket_id {
                        state
                            .socket_io
                            .to(socket_id)
                            .emit("terminal_error", &format!("Error flushing terminal: {}", e))
                            .await
                            .ok();
                    }
                } else {
                    println!("Terminal input written successfully for {}", email);
                }
            }
            Err(e) => {
                println!("Error writing to terminal: {}", e);
                if let Some(socket_id) = socket_id {
                    state
                        .socket_io
                        .to(socket_id)
                        .emit(
                            "terminal_error",
                            &format!("Error writing to terminal: {}", e),
                        )
                        .await
                        .ok();
                }
                return Err(e);
            }
        }
    } else {
        let error_msg = format!("No terminal found for email: {}", email);

        if let Some(socket_id) = socket_id {
            state
                .socket_io
                .to(socket_id)
                .emit("terminal_error", &error_msg)
                .await
                .ok();
        }

        return Err(std::io::Error::new(std::io::ErrorKind::NotFound, error_msg));
    }

    Ok(())
}

pub async fn handle_terminal_resize(
    state: AppState,
    data: TerminalResizePayload,
) -> Result<(), std::io::Error> {
    let socket_id = state
        .email_mapping
        .lock()
        .unwrap()
        .get(&data.email)
        .cloned();

    if socket_id.is_none() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Socket ID not found in mapping",
        ));
    }

    let email = data.email.clone();

    let terminal_file_opt = {
        let terminal_mapping = state.terminal_mapping.lock().unwrap();
        terminal_mapping
            .get(&email)
            .and_then(|f| f.as_ref())
            .map(|f| f.try_clone())
    };

    if let Some(Ok(terminal_file)) = terminal_file_opt {
        let winsize = Winsize {
            ws_row: data.rows,
            ws_col: data.cols,
            ws_xpixel: 0,
            ws_ypixel: 0,
        };

        let fd = terminal_file.as_raw_fd();
        unsafe {
            let result = libc::ioctl(fd, libc::TIOCSWINSZ, &winsize as *const Winsize);
            if result != 0 {
                let error_msg = format!("Failed to resize terminal: errno {}", result);
                println!("{}", error_msg);

                if let Some(socket_id) = socket_id {
                    state
                        .socket_io
                        .to(socket_id)
                        .emit("terminal_error", &error_msg)
                        .await
                        .ok();
                }

                return Err(std::io::Error::new(std::io::ErrorKind::Other, error_msg));
            }
        }

        println!(
            "Terminal resized to {}x{} for {}",
            data.cols, data.rows, email
        );
    } else {
        let error_msg = format!("No terminal found for email: {}", email);

        if let Some(socket_id) = socket_id {
            state
                .socket_io
                .to(socket_id)
                .emit("terminal_error", &error_msg)
                .await
                .ok();
        }

        return Err(std::io::Error::new(std::io::ErrorKind::NotFound, error_msg));
    }

    Ok(())
}

pub async fn handle_close_terminal(
    state: AppState,
    data: CloseTerminalPayload,
) -> Result<(), std::io::Error> {
    let email = data.email.clone();

    {
        let mut terminal_mapping = state.terminal_mapping.lock().unwrap();
        terminal_mapping.remove(&email);
    }

    let socket_id = {
        let mut email_mapping = state.email_mapping.lock().unwrap();
        let socket_id = email_mapping.remove(&email);

        if let Some(sid) = socket_id {
            let mut socket_mapping = state.socket_mapping.lock().unwrap();
            socket_mapping.remove(&sid);
            Some(sid)
        } else {
            None
        }
    };

    if let Some(socket_id) = socket_id {
        state
            .socket_io
            .to(socket_id)
            .emit("terminal_closed", "Terminal session closed")
            .await
            .ok();
    }

    println!("Terminal closed for {}", email);

    Ok(())
}

pub async fn handle_terminal_write(
    state: AppState,
    data: LoadTerminalPayload,
) -> Result<(), std::io::Error> {
    let socket_id = state
        .email_mapping
        .lock()
        .unwrap()
        .get(&data.email)
        .cloned();

    if socket_id.is_none() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Socket ID not found in mapping",
        ));
    }

    let email = data.email.clone();

    if let Some(command) = data.command {
        let mut terminal_file_opt = None;

        {
            let terminal_mapping = state.terminal_mapping.lock().unwrap();
            if let Some(Some(file)) = terminal_mapping.get(&email) {
                terminal_file_opt = Some(file.try_clone()?);
            }
        }

        if let Some(mut terminal_file) = terminal_file_opt {
            let mut write_command = command.clone();
            if !write_command.ends_with('\n') {
                write_command.push('\n');
            }

            match terminal_file.write_all(write_command.as_bytes()) {
                Ok(_) => {
                    if let Err(e) = terminal_file.flush() {
                        if let Some(socket_id) = socket_id {
                            state
                                .socket_io
                                .to(socket_id)
                                .emit("terminal_error", &format!("Error flushing terminal: {}", e))
                                .await
                                .ok();
                        }
                    } else {
                        if let Some(socket_id) = socket_id {
                            let success_payload = serde_json::json!({
                                "status": "success",
                                "command": command,
                                "message": "Command successfully sent to terminal"
                            });

                            state
                                .socket_io
                                .to(socket_id)
                                .emit("terminal_data", &success_payload)
                                .await
                                .ok();

                            println!("Emitted terminal_data event to client");
                        }
                    }
                }
                Err(e) => {
                    if let Some(socket_id) = socket_id {
                        state
                            .socket_io
                            .to(socket_id)
                            .emit(
                                "terminal_error",
                                &format!("Error writing to terminal: {}", e),
                            )
                            .await
                            .ok();
                    }

                    return Err(e);
                }
            }
        } else {
            let error_msg = format!("No terminal found for email: {}", email);

            if let Some(socket_id) = socket_id {
                state
                    .socket_io
                    .to(socket_id)
                    .emit("terminal_error", &error_msg)
                    .await
                    .ok();
            }

            return Err(std::io::Error::new(std::io::ErrorKind::NotFound, error_msg));
        }
    } else {
        if let Some(socket_id) = socket_id {
            state
                .socket_io
                .to(socket_id)
                .emit("terminal_error", "No command provided")
                .await
                .ok();
        }

        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "No command provided",
        ));
    }

    Ok(())
}
