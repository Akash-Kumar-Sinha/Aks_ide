// socket_handler/terminal_events.rs
use socketioxide::extract::{Data, SocketRef};
use serde::Deserialize;
use crate::AppState;
use crate::socket_handler::pseudo_terminal::{write_to_terminal, close_terminal};

// Define our data structures for various terminal events
#[derive(Debug, Clone, Deserialize)]
pub struct TerminalWritePayload {
    pub data: String,
    pub email: Option<String>,  // Optional user identifier
}

#[derive(Debug, Clone, Deserialize)]
pub struct TerminalResizePayload {
    pub rows: u16,
    pub cols: u16,
    pub email: Option<String>,
}

// Handler for terminal-related socket events
pub fn register_terminal_handlers(s: SocketRef, state: AppState) {
    // Register event handlers for different terminal events
    handle_terminal_write(s.clone(), state.clone());
    handle_terminal_resize(s.clone(), state.clone());
    handle_terminal_close(s.clone(), state.clone());
    
    println!("✅ Terminal event handlers registered for socket: {}", s.id);
}

// Handle terminal write events (when user types in the terminal)
fn handle_terminal_write(s: SocketRef, state: AppState) {
    s.on(
        "terminal_write",
        move |s: SocketRef, Data::<TerminalWritePayload>(payload): Data<TerminalWritePayload>| {
            let state_clone = state.clone();
            println!("Received terminal_write event from socket {}", s.id);
            
            // Write the data to the terminal
            match write_to_terminal(&state_clone, &payload.data) {
                Ok(_) => {
                    // Successfully wrote to terminal - no need to acknowledge in most cases
                    // But we could if needed: s.emit("terminal_write_ack", "ok").ok();
                },
                Err(e) => {
                    println!("Error writing to terminal: {}", e);
                    s.emit("terminal_error", &format!("Write error: {}", e)).ok();
                }
            }
        },
    );
}

// Handle terminal resize events
fn handle_terminal_resize(s: SocketRef, state: AppState) {
    s.on(
        "terminal_resize",
        move |s: SocketRef, Data::<TerminalResizePayload>(payload): Data<TerminalResizePayload>| {
            println!("Received terminal_resize event: {}x{}", payload.rows, payload.cols);
            
            // Here you would implement the resize functionality
            // This would typically involve using ioctl with TIOCSWINSZ
            // For now we'll just acknowledge it
            s.emit("terminal_resize_ack", &format!("Resize to {}x{} acknowledged", payload.rows, payload.cols)).ok();
        },
    );
}

// Handle terminal close events
fn handle_terminal_close(s: SocketRef, state: AppState) {
    s.on(
        "terminal_close",
        move |s: SocketRef| {
            let state_clone = state.clone();
            println!("Received terminal_close event from socket {}", s.id);
            
            match close_terminal(&state_clone) {
                Ok(_) => {
                    s.emit("terminal_closed", "Terminal session closed").ok();
                },
                Err(e) => {
                    println!("Error closing terminal: {}", e);
                    s.emit("terminal_error", &format!("Close error: {}", e)).ok();
                }
            }
        },
    );
}