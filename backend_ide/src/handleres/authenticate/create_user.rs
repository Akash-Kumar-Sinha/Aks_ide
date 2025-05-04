use axum::extract::State;
use axum::{http::StatusCode, Json};
use bcrypt::{hash, DEFAULT_COST};
use chrono::Utc;
use dotenv::dotenv;
use log::info;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

use crate::entities::{profile, user};
use crate::AppState;

use super::token::{generate_access_token, generate_refresh_token};

#[derive(Deserialize)]
pub struct CreateUserRequest {
    pub email: String,
    pub password: String,
    pub name: Option<String>,
    pub avatar: Option<String>,
}

#[derive(Serialize)]
pub struct CreateUserResponse {
    pub success: bool,
    pub message: String,
    pub refresh_token: Option<String>,
    pub access_token: Option<String>,
}

pub async fn create_user(
    State(state): State<AppState>,
    Json(request): Json<CreateUserRequest>,
) -> (StatusCode, Json<CreateUserResponse>) {
    dotenv().ok();
    info!("Create user is being called");
    if request.email.is_empty() || request.password.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(CreateUserResponse {
                success: false,
                message: "Email and password are required".to_string(),
                refresh_token: None,
                access_token: None,
            }),
        );
    }

    let existing_user = match user::Entity::find()
        .filter(user::Column::Email.eq(&request.email))
        .one(&*state.db)
        .await
    {
        Ok(user) => user,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(CreateUserResponse {
                    success: false,
                    message: format!("Database error: {}", e),
                    refresh_token: None,
                    access_token: None,
                }),
            );
        }
    };

    if let Some(existing_user) = existing_user {
        if let Some(ref stored_hash) = existing_user.hashed_password {
            if bcrypt::verify(&request.password, stored_hash).unwrap_or(false) {
                let mut payload = BTreeMap::new();
                payload.insert(
                    "email".to_string(),
                    existing_user.email.clone().unwrap_or_default(),
                );
                payload.insert("login_at".to_string(), Utc::now().to_rfc3339());

                let refresh_token = generate_refresh_token(payload.clone()).await.unwrap();
                let access_token = generate_access_token(payload).await.unwrap();

                let mut active_user: user::ActiveModel = existing_user.into();
                active_user.refresh_token = Set(Some(refresh_token.clone()));
                let _ = active_user.update(&*state.db).await;

                return (
                    StatusCode::OK,
                    Json(CreateUserResponse {
                        success: true,
                        message: "Login successful".to_string(),
                        refresh_token: Some(refresh_token),
                        access_token: Some(access_token),
                    }),
                );
            } else {
                return (
                    StatusCode::UNAUTHORIZED,
                    Json(CreateUserResponse {
                        success: false,
                        message: "Incorrect password".to_string(),
                        refresh_token: None,
                        access_token: None,
                    }),
                );
            }
        } else {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(CreateUserResponse {
                    success: false,
                    message: "User exists but no password stored".to_string(),
                    refresh_token: None,
                    access_token: None,
                }),
            );
        }
    }

    let hashed_password = match hash(&request.password, DEFAULT_COST) {
        Ok(hash) => hash,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(CreateUserResponse {
                    success: false,
                    message: format!("Password hashing failed: {}", e),
                    refresh_token: None,
                    access_token: None,
                }),
            );
        }
    };

    let mut payload = BTreeMap::new();
    payload.insert("email".to_string(), request.email.clone());
    payload.insert("created_at".to_string(), Utc::now().to_rfc3339());

    let refresh_token = match generate_refresh_token(payload.clone()).await {
        Some(token) => token,
        None => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(CreateUserResponse {
                    success: false,
                    message: "Failed to generate refresh token".to_string(),
                    refresh_token: None,
                    access_token: None,
                }),
            );
        }
    };

    let access_token = match generate_access_token(payload).await {
        Some(token) => token,
        None => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(CreateUserResponse {
                    success: false,
                    message: "Failed to generate access token".to_string(),
                    refresh_token: None,
                    access_token: None,
                }),
            );
        }
    };

    let new_profile = profile::ActiveModel {
        email: Set(Some(request.email.clone())),
        name: Set(request.name.clone()),
        avatar: Set(request.avatar.clone()),
        created_at: Set(Utc::now().naive_utc()),
        ..Default::default()
    };

    let inserted_profile = match new_profile.insert(&*state.db).await {
        Ok(profile) => profile,
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(CreateUserResponse {
                    success: false,
                    message: format!("Failed to create profile: {}", e),
                    refresh_token: None,
                    access_token: None,
                }),
            );
        }
    };
    let new_user = user::ActiveModel {
        email: Set(Some(request.email)),
        hashed_password: Set(Some(hashed_password)),
        name: Set(request.name),
        avatar: Set(request.avatar),
        refresh_token: Set(Some(refresh_token.clone())),
        profile_id: Set(inserted_profile.id),
        created_at: Set(Utc::now().naive_utc()),
        ..Default::default()
    };

    match new_user.insert(&*state.db).await {
        Ok(_) => (
            StatusCode::CREATED,
            Json(CreateUserResponse {
                success: true,
                message: "User created successfully".to_string(),
                refresh_token: Some(refresh_token),
                access_token: Some(access_token),
            }),
        ),
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(CreateUserResponse {
                success: false,
                message: format!("Failed to create user: {}", e),
                refresh_token: None,
                access_token: None,
            }),
        ),
    }
}
