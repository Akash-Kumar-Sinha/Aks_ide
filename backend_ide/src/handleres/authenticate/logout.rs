use std::env;
use axum::{extract::State, http::StatusCode, Extension, Json};
use dotenv::dotenv;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter, Set};
use tracing;
use serde::Serialize;

use crate::{entities::user, AppState};

#[derive(Serialize)]
pub struct LogoutResponse {
    pub success: bool,
    pub message: String,
}

pub async fn logout(
    State(state): State<AppState>,
    Extension(email): Extension<String>,
) -> (StatusCode, Json<LogoutResponse>) {
    dotenv().ok();

    match user::Entity::find()
        .filter(user::Column::Email.eq(&email))
        .one(&*state.db)
        .await
    {
        Ok(Some(user)) => {
            let mut user_active = user.into_active_model();
            user_active.refresh_token = Set(None);

            if let Err(e) = user_active.update(&*state.db).await {
                tracing::error!("Failed to update user: {}", e);

                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(LogoutResponse {
                        success: false,
                        message: "Failed to update user".to_string(),
                    }),
                );
            }

            (
                StatusCode::OK,
                Json(LogoutResponse {
                    success: true,
                    message: "Successfully logged out".to_string(),
                }),
            )
        }
        Ok(None) => (
            StatusCode::UNAUTHORIZED,
            Json(LogoutResponse {
                success: false,
                message: "User not found".to_string(),
            }),
        ),
        Err(e) => {
            tracing::error!("Database error: {}", e);

            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(LogoutResponse {
                    success: false,
                    message: "Database error".to_string(),
                }),
            )
        }
    }
}
