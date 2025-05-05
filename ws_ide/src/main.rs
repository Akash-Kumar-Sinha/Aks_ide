use dotenv::dotenv;
use futures_util::{SinkExt, StreamExt};
use sea_orm::DatabaseConnection;
use serde::Deserialize;
use serde_json;
use tokio_tungstenite::WebSocketStream;
use std::{env, net::TcpStream, sync::{Arc, RwLock}};
use tokio::net::TcpListener;
use tokio_websockets::{Error, ServerBuilder};
use tungstenite::handshake::server::{Request, Response};
use tokio::sync::mpsc;


mod db;
mod docker_vm;
mod entities;
mod events;
mod socket_handler;

use events::{event_handler, Event};

#[derive(Clone, Debug)]
pub struct AppState {
    pub db: Arc<DatabaseConnection>,
    pub socket_connections: Arc<RwLock<Vec<WebSocketStream<TcpStream>>>>,
    pub event_tx: mpsc::Sender<Event>,
}
#[derive(Deserialize)]
struct ClientMessage {
    event: String,
    email: Option<String>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenv().ok();
    let port = env::var("PORT").unwrap_or_else(|_| "9000".to_string());
    let db = db::connect_db().await;

    let addr = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&addr).await?;

    let (event_tx, event_rx) = tokio::sync::mpsc::channel::<Event>(100);
    tokio::spawn(event_handler(event_rx));

    while let Ok((stream, _)) = listener.accept().await {
        let callback = |req: &Request, mut response: Response| {
            if let Some(origin) = req.headers().get("origin") {
                println!("Origin: {:?}", origin);
                // You could add validation here if needed
            }
            Ok::<_, tungstenite::Error>(response)
        };

        let (_request, mut ws_stream) = match ServerBuilder::new().accept(stream).await {
            Ok(res) => res,
            Err(e) => {
                eprintln!("WebSocket handshake failed: {:?}", e);
                continue;
            }
        };
        let app_state = AppState {
            db: Arc::new(db.clone()),
            socket_connections: Arc::new(RwLock::new(vec![])),
            event_tx: event_tx.clone(),    
        };

        let state = app_state.clone();
        let tx = event_tx.clone();

        tokio::spawn(async move {
            let client_id = rand::random::<u32>();
            tx.send(Event::ClientConnected(client_id)).await.unwrap();

            if let Err(e) = async {
                while let Some(Ok(msg)) = ws_stream.next().await {
                    if msg.is_text() || msg.is_binary() {
                        let message = msg.as_text().unwrap_or_default().to_string();

                        if let Ok(parsed) = serde_json::from_str::<ClientMessage>(&message) {
                            match parsed.event.as_str() {
                                "load_terminal" => {
                                    if let Some(email) = parsed.email {
                                        tx.send(Event::LoadTerminal(
                                            client_id,
                                            state.clone(),
                                            email,
                                        ))
                                        .await
                                        .unwrap();
                                    } else {
                                        eprintln!("❌ Email missing in 'load_terminal' event");
                                    }
                                }
                                _ => {
                                    tx.send(Event::MessageReceived(client_id, message))
                                        .await
                                        .unwrap();
                                }
                            }
                        } else {
                            // fallback: just echo message
                            tx.send(Event::MessageReceived(client_id, message.clone()))
                                .await
                                .unwrap();
                        }

                        ws_stream.send(msg).await?;
                    }
                }
                Ok::<_, Error>(())
            }
            .await
            {
                eprintln!("Connection error: {:?}", e);
            }

            tx.send(Event::ClientDisconnected(client_id)).await.unwrap();
        });
    }

    Ok(())
}
