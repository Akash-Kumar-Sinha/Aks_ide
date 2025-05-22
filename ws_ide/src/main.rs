use axum::{
    http::{
        header::{AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method,
    },
    routing::get,
};
use sea_orm::DatabaseConnection;
use serde::Deserialize;
use socket_handler::{load_terminal::load_terminal, terminal_events::handle_terminal_write};
use socketioxide::{
    extract::{Data, SocketRef},
    socket::Sid,
    SocketIo,
};
use std::collections::HashMap;
use std::env;
use std::fs::File;
use std::sync::{Arc, Mutex};

use tower_http::cors::CorsLayer;

mod db;
mod docker_vm;
mod entities;
mod socket_handler;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<DatabaseConnection>,
    pub socket_io: Arc<SocketIo>,
    // pub terminal: Arc<Mutex<Option<File>>>,
    pub terminal_mapping: Arc<Mutex<HashMap<String, Option<File>>>>,
    pub socket_mapping: Arc<Mutex<HashMap<Sid, String>>>,
    pub email_mapping: Arc<Mutex<HashMap<String, Sid>>>,
}

#[derive(Debug, Clone, Deserialize)]
struct LoadTerminalPayload {
    email: String,
    command: Option<String>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Configure environment
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
        .allow_headers([AUTHORIZATION, CONTENT_TYPE])
        .allow_credentials(true);

    let port = env::var("PORT").unwrap_or_else(|_| "9000".to_string());
    let db = db::connect_db().await;

    // Set up SocketIO
    let (layer, io) = SocketIo::new_layer();

    // Initialize app state
    let app_state = AppState {
        db: Arc::new(db),
        socket_io: Arc::new(io.clone()),
        terminal_mapping: Arc::new(Mutex::new(HashMap::new())),
        socket_mapping: Arc::new(Mutex::new(HashMap::new())),
        email_mapping: Arc::new(Mutex::new(HashMap::new())),
    };

    // Clone for the namespace handler
    let app_state_clone = app_state.clone();

    io.ns("/", move |s: SocketRef| {
        println!("New connection: {:?}", s.id);

        s.on(
            "message",
            |s: SocketRef, Data::<String>(data): Data<String>| {
                println!("📥 Received message: {}", data);
                s.emit("message-back", "Hello from server!").ok();
            },
        );

        let app_state_inner = app_state_clone.clone();
        s.on("load_terminal", {
            let app_state = app_state_inner.clone();
            move |s: SocketRef, Data::<LoadTerminalPayload>(payload): Data<LoadTerminalPayload>| {
                let app_state = app_state.clone();
                let socket_id = s.id;
                app_state
                    .socket_mapping
                    .lock()
                    .unwrap()
                    .insert(s.id.clone(), payload.email.clone());

                app_state
                    .email_mapping
                    .lock()
                    .unwrap()
                    .insert(payload.email.clone(), s.id.clone());

                Box::pin(async move {
                    load_terminal(socket_id, app_state, payload.email).await;
                })
            }
        });

        let app_state_inner = app_state_clone.clone();
        s.on("terminal_write", {
            let app_state = app_state_inner.clone();
            move |s: SocketRef, Data::<LoadTerminalPayload>(payload): Data<LoadTerminalPayload>| {
                let app_state = app_state.clone();
                
                Box::pin(async move {
                    println!("Terminal writing for {}", payload.email);

                    
                    match handle_terminal_write(app_state, payload).await {
                        Ok(_) => {
                            println!("]Terminal write completed successfully");
                        }
                        Err(e) => {
                            println!("Terminal write failed: {}", e);
                            
                        }
                    }
                })
            }
        });
    });

    let app = axum::Router::new()
        .route("/", get(|| async { "Terminal Server Running" }))
        .route("/health", get(|| async { "OK" }))
        .with_state(app_state)
        .layer(layer)
        .layer(cors);

    // Start the server
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");

    println!("🚀 Server running at http://{}", addr);
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
