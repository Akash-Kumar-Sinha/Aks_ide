use socketioxide::extract::SocketRef;
use std::process::Command;

use crate::{
    events,
    state::AppState,
    types::SaveFileContentPayload,
};

pub async fn save_file_data(
    s: SocketRef,
    state: AppState,
    payload: SaveFileContentPayload,
) -> Result<(), std::io::Error> {
    let email = payload.email;
    let file_path = payload.path;
    let content = payload.content;

    let container_id = state
        .docker_container_id
        .get(&email)
        .map(|r| r.clone())
        .ok_or_else(|| {
            let msg = format!("No Docker container found for email: {}", email);
            s.emit(events::outgoing::FILE_ERROR, &msg).ok();
            std::io::Error::new(std::io::ErrorKind::NotFound, msg)
        })?;

    if let Some(parent_dir) = std::path::Path::new(&file_path).parent() {
        let _ = Command::new("docker")
            .arg("exec")
            .arg(&container_id)
            .arg("mkdir")
            .arg("-p")
            .arg(parent_dir.to_string_lossy().as_ref())
            .output();
    }

    let temp_path = format!("{}.tmp", file_path);

    let mut child = Command::new("docker")
        .arg("exec")
        .arg("-i")
        .arg(&container_id)
        .arg("tee")
        .arg(&temp_path)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to spawn docker: {}", e),
            )
        })?;

    if let Some(mut stdin) = child.stdin.take() {
        use std::io::Write;
        stdin.write_all(content.as_bytes())?;
    }

    let result = child.wait_with_output()?;
    if !result.status.success() {
        let msg = format!(
            "Failed to write temp file '{}': {}",
            temp_path,
            String::from_utf8_lossy(&result.stderr)
        );
        s.emit(events::outgoing::FILE_ERROR, &msg).ok();
        return Err(std::io::Error::new(std::io::ErrorKind::Other, msg));
    }

    match Command::new("docker")
        .arg("exec")
        .arg(&container_id)
        .arg("mv")
        .arg(&temp_path)
        .arg(&file_path)
        .output()
    {
        Ok(result) if result.status.success() => {
            s.emit(
                events::outgoing::FILE_SAVED,
                &format!("File '{}' saved successfully", file_path),
            )
            .map_err(|e| {
                std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Failed to emit: {}", e),
                )
            })?;
        }
        Ok(result) => {
            let msg = format!(
                "Failed to move temp file to '{}': {}",
                file_path,
                String::from_utf8_lossy(&result.stderr)
            );
            s.emit(events::outgoing::FILE_ERROR, &msg).ok();
            return Err(std::io::Error::new(std::io::ErrorKind::Other, msg));
        }
        Err(e) => {
            let msg = format!("Failed to execute mv command: {}", e);
            s.emit(events::outgoing::FILE_ERROR, &msg).ok();
            return Err(std::io::Error::new(std::io::ErrorKind::Other, msg));
        }
    }

    Ok(())
}
