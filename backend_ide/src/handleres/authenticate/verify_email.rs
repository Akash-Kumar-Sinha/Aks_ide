use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use sea_orm::{ActiveModelTrait, ColumnTrait, DatabaseConnection, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::{entities::email_verification, AppState};

use super::create_token::verify_token;

#[derive(Debug, Deserialize)]
pub struct VerifyParams {
    pub email: String,
    pub token: String,
}

#[derive(Debug, Serialize)]
pub struct VerifyEmailResponse {
    pub success: bool,
    pub message: String,
    pub error: Option<String>,
}

pub async fn verify_email(
    State(state): State<AppState>,
    Path(params): Path<VerifyParams>,
) -> (StatusCode, Json<VerifyEmailResponse>) {
    if let Err(err) = verify_token(&params.token, &params.email) {
        return (
            StatusCode::BAD_REQUEST,
            Json(VerifyEmailResponse {
                success: false,
                message: "Token verification failed".to_string(),
                error: Some(err),
            }),
        );
    }

    match email_verification::Entity::find()
        .filter(email_verification::Column::Email.eq(&params.email))
        .one(&*state.db)
        .await
    {
        Ok(Some(record)) => handle_existing_record(record, params.token, state.db.clone()).await,
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(VerifyEmailResponse {
                success: false,
                message: "Email not found in verification records".to_string(),
                error: None,
            }),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(VerifyEmailResponse {
                success: false,
                message: "Database error".to_string(),
                error: Some(e.to_string()),
            }),
        ),
    }
}

async fn handle_existing_record(
    record: email_verification::Model,
    token: String,
    db: Arc<DatabaseConnection>,
) -> (StatusCode, Json<VerifyEmailResponse>) {
    if record.verification_token != Some(token) {
        return (
            StatusCode::BAD_REQUEST,
            Json(VerifyEmailResponse {
                success: false,
                message: "Invalid token".to_string(),
                error: Some("Token doesn't match our records".to_string()),
            }),
        );
    }

    if record.verified {
        return (
            StatusCode::OK,
            Json(VerifyEmailResponse {
                success: true,
                message: "Email already verified".to_string(),
                error: None,
            }),
        );
    }

    let mut active_record: email_verification::ActiveModel = record.into();
    active_record.verified = Set(true);
    active_record.verification_token = Set(None);

    match active_record.update(&*db).await {
        Ok(_) => (
            StatusCode::OK,
            Json(VerifyEmailResponse {
                success: true,
                message: "Email successfully verified".to_string(),
                error: None,
            }),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(VerifyEmailResponse {
                success: false,
                message: "Failed to update verification status".to_string(),
                error: Some(e.to_string()),
            }),
        ),
    }
}
