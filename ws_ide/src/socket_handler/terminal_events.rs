use crate::{AppState, CloseTerminalPayload, TerminalInputPayload, TerminalResizePayload};
use nix::libc;
use nix::pty::Winsize;
use socketioxide::extract::SocketRef;
use std::io::Write;
use std::os::unix::io::AsRawFd;

pub async fn handle_terminal_input(
    s: &SocketRef,
    state: AppState,
    data: TerminalInputPayload,
) -> Result<(), std::io::Error> {
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
                    s.emit("terminal_error", &format!("Error flushing terminal: {}", e))
                        .ok();
                }
            }
            Err(e) => {
                println!("Error writing to terminal: {}", e);
                s.emit(
                    "terminal_error",
                    &format!("Error writing to terminal: {}", e),
                )
                .ok();
                return Err(e);
            }
        }
    } else {
        let error_msg = format!("No terminal found for email: {}", email);

        s.emit("terminal_error", &error_msg).ok();

        return Err(std::io::Error::new(std::io::ErrorKind::NotFound, error_msg));
    }

    Ok(())
}

pub async fn handle_terminal_resize(
    s: &SocketRef,
    state: AppState,
    data: TerminalResizePayload,
) -> Result<(), std::io::Error> {
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

                s.emit("terminal_error", &error_msg).ok();

                return Err(std::io::Error::new(std::io::ErrorKind::Other, error_msg));
            }
        }
    } else {
        let error_msg = format!("No terminal found for email: {}", email);

        s.emit("terminal_error", &error_msg).ok();

        return Err(std::io::Error::new(std::io::ErrorKind::NotFound, error_msg));
    }

    Ok(())
}

pub async fn handle_close_terminal(
    s: &SocketRef,
    state: AppState,
    data: CloseTerminalPayload,
) -> Result<(), std::io::Error> {
    let email = data.email.clone();

    {
        let mut terminal_mapping = state.terminal_mapping.lock().unwrap();
        terminal_mapping.remove(&email);
    }

    s.emit("terminal_closed", "Terminal session closed").ok();

    Ok(())
}
