use tokio::sync::mpsc;
use tokio_websockets::Message;
use std::collections::HashMap;
use std::sync::Arc;

use crate::{socket_handler::load_terminal::load_terminal, AppState};

#[derive(Debug)]
pub enum Event {
    ClientConnected(u32),
    ClientDisconnected(u32),
    MessageReceived(u32, String),
    LoadTerminal(u32, AppState, String),
    // WebSocketMessage(Message),
    // PtyProcessStarted,
    // PtyProcessEnded,
    // RegisterPtyInput(tokio::sync::mpsc::Sender<Vec<u8>>),
}

pub async fn event_handler(mut rx: mpsc::Receiver<Event>) {
    // Keep track of active PTY input senders for each client
    let mut pty_input_senders: HashMap<u32, mpsc::Sender<Vec<u8>>> = HashMap::new();
    
    let mut active_clients: Vec<u32> = Vec::new();
    
    while let Some(event) = rx.recv().await {
        match event {
            Event::ClientConnected(id) => {
                println!("🟢 Client {} connected", id);
                active_clients.push(id);
            }
            Event::ClientDisconnected(id) => {
                println!("🔴 Client {} disconnected", id);
        
                if let Some(pos) = active_clients.iter().position(|&x| x == id) {
                    active_clients.remove(pos);
                }
                
                pty_input_senders.remove(&id);
            }
            Event::MessageReceived(id, msg) => {
                println!("💬 Client {} says: {}", id, msg);
                
            }
            Event::LoadTerminal(id, state, email) => {
                println!("🖥️ Loading terminal for client {}", id);
                load_terminal(id, state, email).await;
            }
        }
    }
}