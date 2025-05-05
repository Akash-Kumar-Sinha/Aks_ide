use crate::{events::Event, AppState};
use futures_util::{SinkExt, StreamExt};
use nix::pty::{openpty, Winsize};
use std::pin::Pin;
use std::sync::Arc;
use std::{
    io::{self, Read, Write},
    process::{Command, Stdio},
};
use tokio::net::{TcpListener, TcpStream};
use tokio::task;
// use tokio_tungstenite::protocol::message::Message;
use serde_json;
use tokio_tungstenite::tungstenite::protocol::Message;

pub async fn start_pty_process(
    docker_container_id: Option<String>,
    state: AppState,
) -> Result<(), io::Error> {
    let openpty_result = openpty(None, None).expect("Failed to open PTY");
    let master_fd = openpty_result.master;
    let slave_fd = openpty_result.slave;
    println!("Started PTY process");

    let container_id = docker_container_id.unwrap_or_else(|| "your-container-id".to_string());
    let shell_command = "/bin/bash"; // Example shell command

    let mut child = Command::new("docker")
        .arg("exec")
        .arg("-it")
        .arg(container_id)
        .arg(shell_command)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()?;

    let stdout = Arc::new(tokio::sync::Mutex::new(
        child.stdout.take().expect("Failed to capture stdout"),
    ));
    let stdin = Arc::new(tokio::sync::Mutex::new(
        child.stdin.take().expect("Failed to capture stdin"),
    ));

    // Use the shared AppState to access the WebSocket connections and send terminal output to clients
    let ws_tx = state.socket_connections.clone(); // Arc of RwLock, to share the WebSocket connections

    Ok(())
}
