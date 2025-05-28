use socketioxide::extract::SocketRef;
use std::process::Command;

use crate::{AppState, FileContentPayload, SaveFileContentPayload};

pub async fn get_file_data(
    s: SocketRef,
    state: AppState,
    payload: FileContentPayload,
) -> Result<(), std::io::Error> {
    let email = payload.email.clone();
    let file_path = payload.path.clone();

    let docker_container_id = state
        .docker_container_id
        .lock()
        .unwrap()
        .get(&email)
        .cloned();

    if docker_container_id.is_none() {
        let err_msg = format!("No Docker container found for email: {}", email);
        println!("Error: {}", err_msg);
        s.emit("file_error", &err_msg).map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to emit error: {}", e),
            )
        })?;
        return Err(std::io::Error::new(std::io::ErrorKind::NotFound, err_msg));
    }

    let container_id = docker_container_id.clone().flatten().ok_or_else(|| {
        std::io::Error::new(std::io::ErrorKind::InvalidInput, "Missing container ID")
    })?;

    let output = Command::new("docker")
        .arg("exec")
        .arg(&container_id)
        .arg("cat")
        .arg(&file_path)
        .output();

    match output {
        Ok(result) => {
            if result.status.success() {
                let content = String::from_utf8_lossy(&result.stdout).to_string();

                s.emit("files_data", &content).map_err(|e| {
                    std::io::Error::new(
                        std::io::ErrorKind::Other,
                        format!("Failed to emit data: {}", e),
                    )
                })?;
            } else {
                let error_msg = String::from_utf8_lossy(&result.stderr);
                let err_msg = format!("Failed to read file '{}': {}", file_path, error_msg);
                println!("Error: {}", err_msg);

                s.emit("file_error", &err_msg).map_err(|e| {
                    std::io::Error::new(
                        std::io::ErrorKind::Other,
                        format!("Failed to emit error: {}", e),
                    )
                })?;

                return Err(std::io::Error::new(std::io::ErrorKind::Other, err_msg));
            }
        }
        Err(e) => {
            let err_msg = format!("Failed to execute docker command: {}", e);
            println!("Error: {}", err_msg);

            s.emit("file_error", &err_msg).map_err(|e| {
                std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Failed to emit error: {}", e),
                )
            })?;

            return Err(std::io::Error::new(std::io::ErrorKind::Other, err_msg));
        }
    }

    Ok(())
}

pub async fn save_file_data(
    s: SocketRef,
    state: AppState,
    payload: SaveFileContentPayload,
) -> Result<(), std::io::Error> {
    let email = payload.email.clone();
    let file_path = payload.path.clone();
    let content = payload.content.clone();

    let docker_container_id = state
        .docker_container_id
        .lock()
        .unwrap()
        .get(&email)
        .cloned();

    if docker_container_id.is_none() {
        let err_msg = format!("No Docker container found for email: {}", email);
        println!("Error: {}", err_msg);
        s.emit("file_error", &err_msg).map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to emit error: {}", e),
            )
        })?;
        return Err(std::io::Error::new(std::io::ErrorKind::NotFound, err_msg));
    }

    let container_id = docker_container_id.clone().flatten().ok_or_else(|| {
        std::io::Error::new(std::io::ErrorKind::InvalidInput, "Missing container ID")
    })?;

    if let Some(parent_dir) = std::path::Path::new(&file_path).parent() {
        let mkdir_output = Command::new("docker")
            .arg("exec")
            .arg(&container_id)
            .arg("mkdir")
            .arg("-p")
            .arg(parent_dir.to_string_lossy().as_ref())
            .output();

        match mkdir_output {
            Ok(result) => {
                if !result.status.success() {
                    println!(
                        "Warning: Failed to create directory: {}",
                        String::from_utf8_lossy(&result.stderr)
                    );
                }
            }
            Err(e) => {
                println!("Warning: Failed to execute mkdir: {}", e);
            }
        }
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
                format!("Failed to spawn docker command: {}", e),
            )
        })?;

    if let Some(mut stdin) = child.stdin.take() {
        use std::io::Write;
        stdin.write_all(content.as_bytes()).map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to write to stdin: {}", e),
            )
        })?;

        drop(stdin);
    }

    let result = child.wait_with_output().map_err(|e| {
        std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to wait for process: {}", e),
        )
    })?;

    if !result.status.success() {
        let error_msg = String::from_utf8_lossy(&result.stderr);
        let err_msg = format!("Failed to write temp file '{}': {}", temp_path, error_msg);
        println!("Error: {}", err_msg);
        s.emit("file_error", &err_msg).map_err(|e| {
            std::io::Error::new(
                std::io::ErrorKind::Other,
                format!("Failed to emit error: {}", e),
            )
        })?;
        return Err(std::io::Error::new(std::io::ErrorKind::Other, err_msg));
    }

    let mv_result = Command::new("docker")
        .arg("exec")
        .arg(&container_id)
        .arg("mv")
        .arg(&temp_path)
        .arg(&file_path)
        .output();

    match mv_result {
        Ok(result) => {
            if result.status.success() {
                let verify_result = Command::new("docker")
                    .arg("exec")
                    .arg(&container_id)
                    .arg("wc")
                    .arg("-c")
                    .arg(&file_path)
                    .output();

                match verify_result {
                    Ok(verify) if verify.status.success() => {
                        let size_output = String::from_utf8_lossy(&verify.stdout);
                    }
                    _ => {
                        println!("Warning: Could not verify file size");
                    }
                }

                s.emit(
                    "file_saved",
                    &format!("File '{}' saved successfully", file_path),
                )
                .map_err(|e| {
                    std::io::Error::new(
                        std::io::ErrorKind::Other,
                        format!("Failed to emit success: {}", e),
                    )
                })?;
            } else {
                let error_msg = String::from_utf8_lossy(&result.stderr);
                let err_msg = format!("Failed to move temp file to '{}': {}", file_path, error_msg);

                s.emit("file_error", &err_msg).map_err(|e| {
                    std::io::Error::new(
                        std::io::ErrorKind::Other,
                        format!("Failed to emit error: {}", e),
                    )
                })?;

                return Err(std::io::Error::new(std::io::ErrorKind::Other, err_msg));
            }
        }
        Err(e) => {
            let err_msg = format!("Failed to execute mv command: {}", e);

            s.emit("file_error", &err_msg).map_err(|e| {
                std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Failed to emit error: {}", e),
                )
            })?;

            return Err(std::io::Error::new(std::io::ErrorKind::Other, err_msg));
        }
    }

    Ok(())
}
