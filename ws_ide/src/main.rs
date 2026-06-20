use axum::{
    http::{
        header::{AUTHORIZATION, CONTENT_TYPE},
        Method,
    },
    routing::get,
};
use socketioxide::SocketIo;
use std::env;
use tower_http::cors::{Any, CorsLayer};

mod db;
mod docker_vm;
mod entities;
mod events;
mod socket_handler;
mod state;
mod types;

use state::AppState;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let port = env::var("PORT").unwrap_or_else(|_| "8084".to_string());

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_origin(Any)
        .allow_headers([AUTHORIZATION, CONTENT_TYPE]);

    let db = db::connect_db().await;
    let app_state = AppState::new(db);

    let (layer, io) = SocketIo::new_layer();
    socket_handler::register_handlers(&io, app_state);

    let app = axum::Router::new()
        .route("/health", get(|| async { "OK" }))
        .layer(layer)
        .layer(cors);

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");

    println!("Server running at http://{}", addr);
    axum::serve(listener, app).await.unwrap();

    Ok(())
}
