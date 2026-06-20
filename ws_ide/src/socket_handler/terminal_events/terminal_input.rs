use socketioxide::extract::SocketRef;

use crate::{
    events,
    state::{terminal_key, AppState},
    types::{TerminalInputPayload, TerminalStatusPayload},
};

pub async fn handle_terminal_input(
    s: &SocketRef,
    state: AppState,
    data: TerminalInputPayload,
) -> Result<(), std::io::Error> {
    let key = terminal_key(&data.email, &data.terminal_id);
    let input_data = data.data;

    let file = state
        .terminal_mapping
        .get(&key)
        .map(|f| f.try_clone())
        .transpose()?;

    match file {
        Some(mut f) => {
            tokio::task::spawn_blocking(move || {
                use std::io::Write;
                f.write_all(input_data.as_bytes())?;
                f.flush()
            })
            .await
            .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e))??;
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
