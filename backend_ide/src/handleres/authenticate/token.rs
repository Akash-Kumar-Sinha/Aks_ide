use chrono::{Duration, Utc};
use dotenv::dotenv;
use hmac::{Hmac, Mac};
use jwt::{SignWithKey, VerifyWithKey};
use sha2::Sha256;
use std::collections::BTreeMap;
use std::env;

type HmacSha256 = Hmac<Sha256>;

/// Generic function to sign payload with expiry
async fn sign_jwt_token(
    payload: BTreeMap<String, String>,
    secret_key: &str,
    expiry_seconds: i64,
) -> Option<String> {
    let key = HmacSha256::new_from_slice(secret_key.as_bytes()).ok()?;

    let expiration = Utc::now()
        .checked_add_signed(Duration::seconds(expiry_seconds))
        .unwrap()
        .timestamp()
        .to_string();

    let mut claims = payload.clone();
    claims.insert("exp".to_string(), expiration);

    claims.sign_with_key(&key).ok()
}

/// Generate access token (15 minutes)
pub async fn generate_access_token(payload: BTreeMap<String, String>) -> Option<String> {
    dotenv().ok();
    let secret = env::var("JWT_ACCESS_SECRET").ok()?;
    sign_jwt_token(payload, &secret, 15 * 60).await
}

/// Generate refresh token (180 days)
pub async fn generate_refresh_token(payload: BTreeMap<String, String>) -> Option<String> {
    dotenv().ok();
    let secret = env::var("JWT_REFRESH_SECRET").ok()?;
    sign_jwt_token(payload, &secret, 180 * 24 * 60 * 60).await
}

/// Verify access token
pub async fn verify_access_token(token: &str) -> Option<BTreeMap<String, String>> {
    dotenv().ok();
    let secret = env::var("JWT_ACCESS_SECRET").ok()?;
    let key = HmacSha256::new_from_slice(secret.as_bytes()).ok()?;
    token.verify_with_key(&key).ok()
}

/// Verify refresh token
pub async fn verify_refresh_token(token: &str) -> Option<BTreeMap<String, String>> {
    dotenv().ok();
    let secret = env::var("JWT_REFRESH_SECRET").ok()?;
    let key = HmacSha256::new_from_slice(secret.as_bytes()).ok()?;
    token.verify_with_key(&key).ok()
}
