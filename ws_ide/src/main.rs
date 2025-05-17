use axum::{
    http::{
        header::{AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method,
    },
    routing::get,
};
use sea_orm::DatabaseConnection;
use serde::Deserialize;
use socket_handler::{
    load_terminal::load_terminal,
    terminal_events::register_terminal_handlers,
};
use socketioxide::{
    extract::{Data, SocketRef},
    SocketIo,
};
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
    pub terminal: Arc<Mutex<Option<File>>>,
}

#[derive(Debug, Clone, Deserialize)]
struct LoadTerminalPayload {
    email: String,
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
        terminal: Arc::new(Mutex::new(None)),
    };

    // Clone for the namespace handler
    let app_state_clone = app_state.clone();

    // Set up socket event handlers
    io.ns("/", move |s: SocketRef| {
        println!("New connection: {:?}", s.id);

        // Simple ping/pong handler
        s.on("message", |s: SocketRef, Data::<String>(data): Data<String>| {
            println!("📥 Received message: {}", data);
            s.emit("message-back", "Hello from server!").ok();
        });

        // Terminal load handler
        let app_state_inner = app_state_clone.clone();
        s.on("load_terminal", {
            let app_state = app_state_inner.clone();
            move |s: SocketRef, Data::<LoadTerminalPayload>(payload): Data<LoadTerminalPayload>| {
                let app_state = app_state.clone();
                let socket_id = s.id;
                Box::pin(async move {
                    println!("📥 Received load_terminal for: {}", payload.email);
                    load_terminal(socket_id, app_state, payload.email).await;
                })
            }
        });

        // Register all terminal-related event handlers
        register_terminal_handlers(s, app_state_clone.clone());
    });

    // Set up the Axum application
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