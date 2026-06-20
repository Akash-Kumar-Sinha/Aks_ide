use dashmap::DashMap;
use sea_orm::DatabaseConnection;
use socketioxide::socket::Sid;
use std::fs::File;
use std::sync::Arc;

pub fn terminal_key(email: &str, terminal_id: &str) -> String {
    format!("{}:{}", email, terminal_id)
}

#[derive(Clone)]
pub struct AppState {
    pub db: Arc<DatabaseConnection>,
    pub terminal_mapping: Arc<DashMap<String, File>>,
    pub back_terminal_mapping: Arc<DashMap<String, File>>,
    pub socket_mapping: Arc<DashMap<Sid, String>>,
    pub email_mapping: Arc<DashMap<String, Sid>>,
    pub docker_container_id: Arc<DashMap<String, String>>,
}

impl AppState {
    pub fn new(db: DatabaseConnection) -> Self {
        Self {
            db: Arc::new(db),
            terminal_mapping: Arc::new(DashMap::new()),
            back_terminal_mapping: Arc::new(DashMap::new()),
            socket_mapping: Arc::new(DashMap::new()),
            email_mapping: Arc::new(DashMap::new()),
            docker_container_id: Arc::new(DashMap::new()),
        }
    }
}
