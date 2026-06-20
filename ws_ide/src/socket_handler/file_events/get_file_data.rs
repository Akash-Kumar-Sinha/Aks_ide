use socketioxide::extract::SocketRef;
use std::process::Command;

use crate::{
    events,
    state::AppState,
    types::FileContentPayload,
};

pub async fn get_file_data(
    s: SocketRef,
    state: AppState,
    payload: FileContentPayload,
) -> Result<(), std::io::Error> {
    let email = payload.email;
    let file_path = payload.path;

    let container_id = state
        .docker_container_id
        .get(&email)
        .map(|r| r.clone())
        .ok_or_else(|| {
            let msg = format!("No Docker container found for email: {}", email);
            s.emit(events::outgoing::FILE_ERROR, &msg).ok();
            std::io::Error::new(std::io::ErrorKind::NotFound, msg)
        })?;

    match Command::new("docker")
        .arg("exec")
        .arg(&container_id)
        .arg("cat")
        .arg(&file_path)
        .output()
    {
        Ok(result) if result.status.success() => {
            let content = String::from_utf8_lossy(&result.stdout).to_string();
            s.emit(events::outgoing::FILES_DATA, &content).map_err(|e| {
                std::io::Error::new(std::io::ErrorKind::Other, format!("Failed to emit: {}", e))
            })?;
        }
        Ok(result) => {
            let msg = format!(
                "Failed to read file '{}': {}",
                file_path,
                String::from_utf8_lossy(&result.stderr)
            );
            s.emit(events::outgoing::FILE_ERROR, &msg).ok();
            return Err(std::io::Error::new(std::io::ErrorKind::Other, msg));
        }
        Err(e) => {
            let msg = format!("Failed to execute docker command: {}", e);
            s.emit(events::outgoing::FILE_ERROR, &msg).ok();
            return Err(std::io::Error::new(std::io::ErrorKind::Other, msg));
        }
    }

    Ok(())
}
