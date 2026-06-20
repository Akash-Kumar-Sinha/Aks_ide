use nix::libc;
use nix::pty::Winsize;
use socketioxide::extract::SocketRef;
use std::os::unix::io::AsRawFd;

use crate::{
    events,
    state::{terminal_key, AppState},
    types::{TerminalResizePayload, TerminalStatusPayload},
};

pub async fn handle_terminal_resize(
    s: &SocketRef,
    state: AppState,
    data: TerminalResizePayload,
) -> Result<(), std::io::Error> {
    let key = terminal_key(&data.email, &data.terminal_id);

    let file = state
        .terminal_mapping
        .get(&key)
        .map(|f| f.try_clone())
        .transpose()?;

    match file {
        Some(f) => {
            let winsize = Winsize {
                ws_row: data.rows,
                ws_col: data.cols,
                ws_xpixel: 0,
                ws_ypixel: 0,
            };
            let fd = f.as_raw_fd();
            unsafe {
                let result = libc::ioctl(fd, libc::TIOCSWINSZ, &winsize as *const Winsize);
                if result != 0 {
                    let msg = format!("Failed to resize terminal: errno {}", result);
                    s.emit(
                        events::outgoing::TERMINAL_ERROR,
                        &TerminalStatusPayload {
                            terminal_id: data.terminal_id,
                            message: msg.clone(),
                        },
                    )
                    .ok();
                    return Err(std::io::Error::new(std::io::ErrorKind::Other, msg));
                }
            }
        }
        None => {
            let msg = format!("No terminal found for key: {}", key);
            s.emit(
                events::outgoing::TERMINAL_ERROR,
                &TerminalStatusPayload {
                    terminal_id: data.terminal_id,
                    message: msg.clone(),
                },
            )
            .ok();
            return Err(std::io::Error::new(std::io::ErrorKind::NotFound, msg));
        }
    }

    Ok(())
}
