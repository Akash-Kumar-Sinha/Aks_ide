
use axum::{extract::State, http::StatusCode, Json, Extension};
use sea_orm::{EntityTrait, QueryFilter, ColumnTrait};
use serde::Serialize;

use crate::{AppState, entities::profile};

#[derive(Serialize)]
pub struct UserProfileResponse {
    success: bool,
    user: Option<profile::Model>,
    message: Option<String>,
}

pub async fn user_profile(
    State(state): State<AppState>,
    Extension(email): Extension<String>,
) -> (StatusCode, Json<UserProfileResponse>) {
    match profile::Entity::find()
        .filter(profile::Column::Email.eq(&email))
        .one(&*state.db)
        .await
    {
        Ok(Some(profile)) => (
            StatusCode::OK,
            Json(UserProfileResponse {
                success: true,
                user: Some(profile),
                message: None,
            }),
        ),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(UserProfileResponse {
                success: false,
                user: None,
                message: Some("Profile not found".to_string()),
            }),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(UserProfileResponse {
                success: false,
                user: None,
                message: Some(format!("Database error: {}", e)),
            }),
        ),
    }
}