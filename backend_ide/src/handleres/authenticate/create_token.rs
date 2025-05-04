use chrono::Utc;
use dotenv::dotenv;
use hmac::{Hmac, Mac};
use jwt::SignWithKey;
use jwt::VerifyWithKey;
use sha2::Sha256;
use std::collections::BTreeMap;
use std::env;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

type HmacSha256 = Hmac<Sha256>;

pub fn create_token(email: String) -> Option<String> {
    dotenv().ok();

    let secret = env::var("JWT_SECRET").ok()?;
    let key = HmacSha256::new_from_slice(secret.as_bytes()).ok()?;

    let expiration = SystemTime::now()
        .checked_add(Duration::from_secs(600))?
        .duration_since(UNIX_EPOCH)
        .ok()?
        .as_secs() as usize;

    let mut claims = BTreeMap::new();
    claims.insert("data", email);
    claims.insert("exp", expiration.to_string());

    let token_str = claims.sign_with_key(&key).ok()?;
    Some(token_str)
}

pub fn verify_token(token: &str, email: &str) -> Result<(), String> {
    dotenv().ok();
    let secret = std::env::var("JWT_SECRET").map_err(|_| "JWT_SECRET not set".to_string())?;

    let key = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|_| "Invalid JWT secret".to_string())?;

    let claims: BTreeMap<String, String> = token
        .verify_with_key(&key)
        .map_err(|e| format!("Invalid token: {}", e))?;

    if claims.get("data").map(|s| s.as_str()) != Some(email) {
        return Err("Token email mismatch".to_string());
    }

    let exp = claims
        .get("exp")
        .ok_or("No expiration time in token".to_string())?;
    let exp_time = exp
        .parse::<i64>()
        .map_err(|_| "Invalid expiration time".to_string())?;

    let current_time = Utc::now().timestamp();
    if current_time > exp_time {
        return Err("Token expired".to_string());
    }

    Ok(())
}
