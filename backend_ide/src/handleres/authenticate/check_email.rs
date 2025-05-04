use axum::{
    extract::{Json, State},
    http::StatusCode,
};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use serde::{Deserialize, Serialize};

use crate::{entities::email_verification, AppState};

#[derive(Debug, Deserialize)]
pub struct CheckEmailRequest {
    pub email: String,
}

#[derive(Debug, Serialize)]
pub struct EmailVerificationResponse {
    pub success: bool,
    pub message: String,
    pub route: Option<String>,
    pub error: Option<String>,
}

pub async fn check_email(
    State(state): State<AppState>,
    Json(payload): Json<CheckEmailRequest>,
) -> (StatusCode, Json<EmailVerificationResponse>) {
    match email_verification::Entity::find()
        .filter(email_verification::Column::Email.eq(&payload.email))
        .one(&*state.db)
        .await
    {
        Ok(Some(user)) => {
            if user.verified {
                (
                    StatusCode::OK,
                    Json(EmailVerificationResponse {
                        success: true,
                        message: "Email already verified".to_string(),
                        route: Some("PASSWORD".to_string()),
                        error: None,
                    }),
                )
            } else {
                (
                    StatusCode::OK,
                    Json(EmailVerificationResponse {
                        success: true,
                        message: "Email not verified".to_string(),
                        route: Some("SENT".to_string()),
                        error: None,
                    }),
                )
            }
        }
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(EmailVerificationResponse {
                success: false,
                message: "User not found".to_string(),
                route: None,
                error: None,
            }),
        ),
        Err(e) => {
            eprintln!("Unable to check email: {}", e);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(EmailVerificationResponse {
                    success: false,
                    message: "Unable to check email".to_string(),
                    route: None,
                    error: Some(e.to_string()),
                }),
            )
        }
    }
}