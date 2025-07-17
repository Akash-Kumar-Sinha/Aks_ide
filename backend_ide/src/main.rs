use crate::handleres::authenticate;
use axum::{
    extract::Extension,
    http::{
        header::{AUTHORIZATION, CONTENT_TYPE},
        HeaderValue, Method,
    },
    middleware,
    routing::{get, post},
    Router,
};
use dotenv::dotenv;
use middlewares::guard::{self, auth_middleware};
use sea_orm::DatabaseConnection;
use std::{env, sync::Arc, thread};
use tower::ServiceBuilder;
use tower_cookies::CookieManagerLayer;
use tower_http::{cors::CorsLayer, trace::TraceLayer};

mod db;
mod entities;
mod handleres;
mod middlewares;

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<DatabaseConnection>,
}

#[tokio::main]
async fn main() {
    dotenv().ok();

    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_origin("http://localhost".parse::<HeaderValue>().unwrap())
        .allow_headers([AUTHORIZATION, CONTENT_TYPE])
        .allow_credentials(true);

    let port = env::var("PORT").unwrap_or_else(|_| "8000".to_string());
    let db = db::connect_db().await;

    let app_state = AppState { db: Arc::new(db) };

    println!(
        "✅ Connected to the database successfully on thread: {:?}",
        thread::current().id()
    );

    let auth_api = Router::new()
        .layer(CookieManagerLayer::new())
        .route(
            "/user_profile",
            get(authenticate::user_profile::user_profile),
        )
        .route("/logout", post(authenticate::logout::logout))
        .layer(middleware::from_fn(auth_middleware));

    let public_api = Router::new()
        .route("/send_token", post(authenticate::send_token::send_token))
        .route(
            "/verify/{email}/{token}",
            get(authenticate::verify_email::verify_email),
        )
        .route("/check_email", post(authenticate::check_email::check_email))
        .route("/create_user", post(authenticate::create_user::create_user))
        .layer(CookieManagerLayer::new());

    let app = Router::new()
        .route("/", get(root))
        .nest("/auth", public_api)
        .nest("/auth", auth_api)
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(Extension(app_state.clone())),
        )
        .with_state(app_state)
        .layer(cors);

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");

    println!("🚀 Server running at http://{}", addr);
    axum::serve(listener, app).await.unwrap();
}
async fn root() -> &'static str {
    "Hello, World from Aks ide!"
}
