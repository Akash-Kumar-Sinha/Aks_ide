use axum::extract::State;
use axum::{http::StatusCode, Json};
use dotenv::dotenv;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde::{Deserialize, Serialize};
use std::env;
use urlencoding::encode;

use crate::entities::prelude::EmailVerification;
use crate::entities::{email_verification, user};
use crate::handleres::authenticate::create_token::create_token;
use crate::AppState;

use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};

#[derive(Deserialize)]
pub struct SendOtp {
    pub email: String,
}

#[derive(Serialize)]
pub struct SendTokenResponse {
    pub success: bool,
    pub message: String,
    pub route: Option<String>,
    pub error: Option<String>,
}

pub async fn send_token(
    State(state): State<AppState>,
    Json(request): Json<SendOtp>,
) -> (StatusCode, Json<SendTokenResponse>) {
    println!("send_token");
    dotenv().ok();

    if request.email.is_empty() {
        return (
            StatusCode::NOT_FOUND,
            Json(SendTokenResponse {
                success: false,
                message: "Email not found".to_string(),
                route: None,
                error: None,
            }),
        );
    }

    match user::Entity::find()
        .filter(user::Column::Email.eq(&request.email))
        .one(&*state.db)
        .await
    {
        Ok(Some(_user)) => {
            return (
                StatusCode::OK,
                Json(SendTokenResponse {
                    success: true,
                    message: "Email already exist".to_string(),
                    route: Some("PASSWORD".to_string()),
                    error: None,
                }),
            );
        }
        Ok(None) => {
            let server_url =
                env::var("SERVER_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());

            let token = match create_token(request.email.clone()) {
                Some(t) => t,
                None => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(SendTokenResponse {
                            success: false,
                            message: "Failed to generate token".to_string(),
                            route: None,
                            error: Some("Token generation failed".to_string()),
                        }),
                    );
                }
            };

            let encoded_email = encode(&request.email);
            let link = format!("{}/auth/verify/{}/{}", server_url, encoded_email, token);

            let email_sender = match env::var("EMAIL") {
                Ok(email) => email,
                Err(_) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(SendTokenResponse {
                            success: false,
                            message: "Server configuration error".to_string(),
                            route: None,
                            error: Some("EMAIL not configured".to_string()),
                        }),
                    );
                }
            };

            let email_password = match env::var("EMAIL_PASSWORD") {
                Ok(password) => password,
                Err(_) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(SendTokenResponse {
                            success: false,
                            message: "Server configuration error".to_string(),
                            route: None,
                            error: Some("EMAIL_PASSWORD not configured".to_string()),
                        }),
                    );
                }
            };

            let email = Message::builder()
                .from(email_sender.parse().unwrap())
                .to(request.email.parse().unwrap())
                .subject("Email Verification")
                .header(ContentType::TEXT_PLAIN)
                .body(format!(
                    "Please verify your email by clicking this link: {}",
                    link
                ))
                .unwrap();

            let creds = Credentials::new(email_sender.clone(), email_password);

            let mailer = SmtpTransport::relay("smtp.gmail.com")
                .unwrap()
                .credentials(creds)
                .build();

            match mailer.send(&email) {
                Ok(_) => {
                    match EmailVerification::find()
                        .filter(email_verification::Column::Email.eq(request.email.clone()))
                        .one(&*state.db)
                        .await
                    {
                        Ok(Some(existing)) => {
                            let mut existing: email_verification::ActiveModel = existing.into();
                            existing.verification_token = Set(Some(token));
                            match existing.update(&*state.db).await {
                                Ok(_) => {
                                    return (
                                        StatusCode::OK,
                                        Json(SendTokenResponse {
                                            success: true,
                                            message: "Verification email updated successfully"
                                                .to_string(),
                                            route: Some("SENT".to_string()),
                                            error: None,
                                        }),
                                    );
                                }
                                Err(e) => {
                                    return (
                                        StatusCode::INTERNAL_SERVER_ERROR,
                                        Json(SendTokenResponse {
                                            success: false,
                                            message: "Failed to update verification record"
                                                .to_string(),
                                            route: None,
                                            error: Some(e.to_string()),
                                        }),
                                    );
                                }
                            }
                        }
                        Ok(None) => {
                            let new_verification = email_verification::ActiveModel {
                                email: Set(request.email.clone()),
                                verification_token: Set(Some(token)),
                                ..Default::default()
                            };

                            match new_verification.insert(&*state.db).await {
                                Ok(_) => {
                                    return (
                                        StatusCode::OK,
                                        Json(SendTokenResponse {
                                            success: true,
                                            message: "Verification email sent successfully"
                                                .to_string(),
                                            route: Some("SENT".to_string()),
                                            error: None,
                                        }),
                                    );
                                }
                                Err(e) => {
                                    return (
                                        StatusCode::INTERNAL_SERVER_ERROR,
                                        Json(SendTokenResponse {
                                            success: false,
                                            message: "Failed to insert verification record"
                                                .to_string(),
                                            route: None,
                                            error: Some(e.to_string()),
                                        }),
                                    );
                                }
                            }
                        }
                        Err(e) => {
                            return (
                                StatusCode::INTERNAL_SERVER_ERROR,
                                Json(SendTokenResponse {
                                    success: false,
                                    message: "Internal database error".to_string(),
                                    route: None,
                                    error: Some(e.to_string()),
                                }),
                            );
                        }
                    }
                }
                Err(e) => {
                    return (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        Json(SendTokenResponse {
                            success: false,
                            message: "Failed to send verification email".to_string(),
                            route: None,
                            error: Some(format!("Email sending error: {}", e)),
                        }),
                    );
                }
            }
        }
        Err(e) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(SendTokenResponse {
                    success: false,
                    message: "Database error".to_string(),
                    route: None,
                    error: Some(e.to_string()),
                }),
            );
        }
    }
}
