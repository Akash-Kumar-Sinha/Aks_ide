use axum::{
    http::{
        header::{AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method,
    },
    routing::get,
};
use sea_orm::DatabaseConnection;
use serde::Deserialize;
use socket_handler::load_terminal::load_terminal;
use socketioxide::{
    extract::{Data, SocketRef},
    SocketIo,
};
use std::{env, sync::Arc};
use tower_http::cors::CorsLayer;

mod db;
mod docker_vm;
mod entities;
mod socket_handler;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<DatabaseConnection>,
}

#[derive(Debug, Clone, Deserialize)]
struct LoadTerminalPayload {
    email: String,
}
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
        .allow_headers([AUTHORIZATION, CONTENT_TYPE])
        .allow_credentials(true);

    let port = env::var("PORT").unwrap_or_else(|_| "9000".to_string());
    let db = db::connect_db().await;

    let app_state = AppState { db: Arc::new(db) };

    let (layer, io) = SocketIo::new_layer();

    let app_state_clone = app_state.clone();

    io.ns("/", move |s: SocketRef| {
        println!("New connection: {:?}", s.id);

        s.on("message", |s: SocketRef| {
            s.emit("message-back", "Hello World!").ok();
        });

        let app_state_inner = app_state_clone.clone();
        s.on("load_terminal", {
            println!("New load terminal: {:?}", s.id);

            let app_state = app_state_inner.clone();
            move |s: SocketRef, Data::<LoadTerminalPayload>(payload): Data<LoadTerminalPayload>| {
                let app_state = app_state.clone();
                // load_terminal(s.id, app_state, payload.email);

                Box::pin(async move {
                    println!("📥 Received load_terminal for: {}", payload.email);
                    load_terminal(s.id, app_state, payload.email).await;
                    s.emit("loaded_terminal", "Terminal Loaded!").ok();
                })
            }
        });
    });

    let app = axum::Router::new()
        .route("/", get(|| async { "Hello, World!" }))
        .with_state(app_state)
        .layer(layer)
        .layer(cors);
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");

    println!("🚀 Server running at http://{}", addr);
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
