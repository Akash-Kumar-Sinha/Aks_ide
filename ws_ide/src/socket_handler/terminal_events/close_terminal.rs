use socketioxide::extract::SocketRef;

use crate::{
    events,
    state::{terminal_key, AppState},
    types::{CloseTerminalPayload, TerminalStatusPayload},
};

pub async fn handle_close_terminal(
    s: &SocketRef,
    state: AppState,
    data: CloseTerminalPayload,
) -> Result<(), std::io::Error> {
    let key = terminal_key(&data.email, &data.terminal_id);
    state.terminal_mapping.remove(&key);

    s.emit(
        events::outgoing::TERMINAL_CLOSED,
        &TerminalStatusPayload {
            terminal_id: data.terminal_id,
            message: "Terminal session closed".to_string(),
        },
    )
    .ok();

    Ok(())
}
