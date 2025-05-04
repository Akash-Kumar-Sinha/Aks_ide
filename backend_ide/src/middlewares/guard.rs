use axum::{
    body::Body,
    extract::State,
    http::{Request, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
    Json, Extension,
};

use axum_extra::TypedHeader;
use headers::{authorization::Bearer, Authorization};
use serde::Serialize;

use crate::handleres::authenticate::token::verify_access_token;

#[derive(Serialize)]
pub struct ErrorResponse {
    success: bool,
    message: String,
}

pub async fn auth_middleware(
    TypedHeader(Authorization(bearer)): TypedHeader<Authorization<Bearer>>,
    mut req: Request<Body>,
    next: Next,
) -> Result<Response, Response> {
    let token = bearer.token();

    let claims = match verify_access_token(token).await {
        Some(c) => c,
        None => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ErrorResponse {
                    success: false,
                    message: "Invalid or expired token".to_string(),
                }),
            )
                .into_response());
        }
    };

    let email = match claims.get("email") {
        Some(email) => email.to_string(),
        None => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse {
                    success: false,
                    message: "Email not found in token".to_string(),
                }),
            )
                .into_response());
        }
    };

    req.extensions_mut().insert(email);

    Ok(next.run(req).await)
}