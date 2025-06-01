use crate::socket_handler::pseudo_terminal::pseudo_back_terminal;
use crate::{AppState, CreateProjectPayload, LoadTerminalPayload};
use regex::Regex;
use serde_json::{json, Value};
use socketioxide::extract::SocketRef;
use std::boxed::Box;
use std::collections::HashMap;
use std::future::Future;
use std::io::Write;
use std::pin::Pin;
use tokio::io::AsyncReadExt;
use tokio::time::{timeout, Duration};

pub async fn get_repo_structure(
    s: &SocketRef,
    state: AppState,
    payload: LoadTerminalPayload,
) -> Result<(), std::io::Error> {
    let email = payload.email.clone();

    let pwd = match get_current_directory(&email, &state).await {
        Ok(dir) => {
            if dir == "/" {
                "/home".to_string()
            } else {
                dir
            }
        }
        Err(e) => {
            s.emit(
                "terminal_error",
                &format!("Failed to get current directory: {}", e),
            )
            .ok();
            return Err(e);
        }
    };

    let mut repo_info = HashMap::new();
    repo_info.insert("current_directory".to_string(), json!(pwd));

    match build_comprehensive_file_tree(&email, &state, &pwd).await {
        Ok(tree) => {
            repo_info.insert("structure".to_string(), json!(tree));
            s.emit("repo_structure", &repo_info).ok();
        }
        Err(e) => {
            println!("Failed to build file tree for {}: {}", email, e);
            s.emit(
                "terminal_error",
                &format!("Failed to build file tree: {}", e),
            )
            .ok();
            return Err(e);
        }
    }

    Ok(())
}

pub async fn create_new_project(
    s: SocketRef,
    state: AppState,
    payload: CreateProjectPayload,
) -> Result<(), std::io::Error> {
    let email = payload.email.clone();

    let mut terminal_file = {
        let terminal_mapping = state.back_terminal_mapping.lock().unwrap();
        match terminal_mapping.get(&email) {
            Some(Some(file)) => file.try_clone()?,
            _ => {
                let err_msg = format!("No terminal found for email: {}", email);
                return Err(std::io::Error::new(std::io::ErrorKind::NotFound, err_msg));
            }
        }
    };

    let sanitized_name = payload
        .project_name
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '-' || *c == '_')
        .collect::<String>();

    if sanitized_name.is_empty() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "Project name contains no valid characters",
        ));
    }

    writeln!(terminal_file, "cd /home")?;
    writeln!(terminal_file, "mkdir {}", sanitized_name)?;

    tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    terminal_file.flush()?;

    s.emit("repo_created", &payload.project_name).ok();
    get_repo_structure(&s, state, LoadTerminalPayload { email }).await?;

    Ok(())
}

fn strip_ansi_codes(text: &str) -> String {
    let ansi_regex = Regex::new(r"\x1b\[[0-9;]*m").unwrap();
    ansi_regex.replace_all(text, "").to_string()
}

async fn get_current_directory(email: &str, state: &AppState) -> Result<String, std::io::Error> {
    let mut terminal_file = {
        let terminal_mapping = state.back_terminal_mapping.lock().unwrap();
        match terminal_mapping.get(email) {
            Some(Some(file)) => file.try_clone()?,
            _ => {
                let error_msg = format!("No terminal found for email: {}", email);
                return Err(std::io::Error::new(std::io::ErrorKind::NotFound, error_msg));
            }
        }
    };

    terminal_file.write_all(b"pwd\n")?;
    terminal_file.flush()?;

    tokio::time::sleep(Duration::from_millis(100)).await;

    match timeout(
        Duration::from_millis(1000),
        read_terminal_output(email.to_string(), state.clone()),
    )
    .await
    {
        Ok(Ok(output)) => {
            let clean_output = strip_ansi_codes(&output);

            let lines: Vec<&str> = clean_output
                .lines()
                .filter(|l| !l.trim().is_empty() && !l.contains("pwd"))
                .filter(|l| !l.starts_with("root@") && !l.contains("#"))
                .collect();

            if let Some(pwd_line) = lines.first() {
                Ok(pwd_line.trim().to_string())
            } else {
                Ok("/".to_string())
            }
        }
        _ => Ok("/".to_string()),
    }
}

async fn build_comprehensive_file_tree(
    email: &str,
    state: &AppState,
    base_path: &str,
) -> Result<HashMap<String, Value>, std::io::Error> {
    build_directory_tree(email, state, base_path, "root", 0, 3).await
}

async fn get_directory_items(
    email: &str,
    state: &AppState,
    path: &str,
) -> Result<Vec<(String, bool)>, std::io::Error> {
    use std::io::Write;

    let mut terminal_file = {
        let terminal_mapping = state.back_terminal_mapping.lock().unwrap();
        match terminal_mapping.get(email) {
            Some(Some(file)) => file.try_clone()?,
            _ => {
                let error_msg = format!("No terminal found for email: {}", email);
                return Err(std::io::Error::new(std::io::ErrorKind::NotFound, error_msg));
            }
        }
    };

    let ls_command = format!("ls -la --color=never '{}' 2>/dev/null | tail -n +2\n", path);

    terminal_file.write_all(ls_command.as_bytes())?;
    terminal_file.flush()?;

    tokio::time::sleep(Duration::from_millis(200)).await;

    let output = match timeout(
        Duration::from_millis(1500),
        read_terminal_output(email.to_string(), state.clone()),
    )
    .await
    {
        Ok(Ok(output)) => output,
        Ok(Err(e)) => {
            return Ok(Vec::new());
        }
        Err(_) => {
            return Ok(Vec::new());
        }
    };

    let clean_output = strip_ansi_codes(&output);

    let mut items = Vec::new();
    let lines: Vec<&str> = clean_output
        .lines()
        .filter(|l| !l.trim().is_empty())
        .filter(|l| !l.contains("ls -la") && !l.starts_with("root@") && !l.contains("#"))
        .filter(|l| !l.starts_with("total "))
        .collect();

    for line in lines {
        let line = line.trim();

        if line.is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 9 {
            continue;
        }

        let permissions = parts[0];
        let filename = parts[8..].join(" ");

        if filename == "." || filename == ".." {
            continue;
        }

        if matches!(
            filename.as_str(),
            "node_modules" | ".git" | "__pycache__" | ".cache"
        ) {
            continue;
        }

        let is_dir = permissions.starts_with('d');

        items.push((filename, is_dir));
    }

    Ok(items)
}

fn build_directory_tree<'a>(
    email: &'a str,
    state: &'a AppState,
    full_path: &'a str,
    dir_name: &'a str,
    current_depth: u32,
    max_depth: u32,
) -> Pin<Box<dyn Future<Output = Result<HashMap<String, Value>, std::io::Error>> + Send + 'a>> {
    Box::pin(async move {
        if current_depth > max_depth {
            return Ok(HashMap::new());
        }

        let items = match get_directory_items(email, state, full_path).await {
            Ok(items) => items,
            Err(e) => {
                println!("Failed to get items for {}: {}", dir_name, e);
                return Ok(HashMap::new());
            }
        };

        let mut tree = HashMap::new();
        let mut directories = Vec::new();
        let mut files = HashMap::new();

        for (name, is_dir) in items {
            if is_dir {
                directories.push(name);
            } else {
                let absolute_path = format!("{}/{}", full_path, name);
                files.insert(absolute_path.clone(), name);
            }
        }

        directories.sort();

        let mut file_entries: Vec<_> = files.into_iter().collect();
        file_entries.sort_by(|a, b| a.1.cmp(&b.1));

        for subdir in directories {
            let subdir_path = format!("{}/{}", full_path, subdir);
            match build_directory_tree(
                email,
                state,
                &subdir_path,
                &subdir,
                current_depth + 1,
                max_depth,
            )
            .await
            {
                Ok(subtree) => {
                    tree.insert(subdir, json!(subtree));
                }
                Err(_) => {
                    tree.insert(subdir, json!({}));
                }
            }
        }

        if !file_entries.is_empty() {
            let mut file_map = serde_json::Map::new();

            let file_count = file_entries.len();
            let display_files = if file_count > 15 {
                let shown_files = &file_entries[..10];
                for (abs_path, name) in shown_files {
                    file_map.insert(abs_path.clone(), json!(name));
                }
                file_map.insert(
                    "...".to_string(),
                    json!(format!("and {} more files", file_count - 10)),
                );
                file_map
            } else {
                for (abs_path, name) in file_entries {
                    file_map.insert(abs_path, json!(name));
                }
                file_map
            };

            tree.insert("_files".to_string(), Value::Object(display_files));
        }

        Ok(tree)
    })
}

pub async fn read_terminal_output(
    email: String,
    state: AppState,
) -> Result<String, std::io::Error> {
    let master_file = {
        let terminal_guard = state.back_terminal_mapping.lock().unwrap();
        match terminal_guard.get(&email) {
            Some(Some(file)) => file.try_clone().map_err(|e| {
                println!("Failed to clone terminal file for {}: {}", email, e);
                std::io::Error::new(std::io::ErrorKind::Other, e)
            })?,
            Some(None) => {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    format!("No active terminal for user: {}", email),
                ));
            }
            None => {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    format!("User {} not found in terminal mapping", email),
                ));
            }
        }
    };

    let mut buffer = [0u8; 4096];
    let mut reader = tokio::fs::File::from_std(master_file);

    match reader.read(&mut buffer).await {
        Ok(0) => {
            {
                let mut terminal_guard = state.back_terminal_mapping.lock().unwrap();
                terminal_guard.remove(&email);
            }
            Err(std::io::Error::new(
                std::io::ErrorKind::UnexpectedEof,
                "Terminal session ended",
            ))
        }
        Ok(n) => {
            if let Ok(text) = std::str::from_utf8(&buffer[0..n]) {
                Ok(text.to_string())
            } else {
                let mut valid_end = n;
                while valid_end > 0 {
                    if let Ok(text) = std::str::from_utf8(&buffer[0..valid_end]) {
                        return Ok(text.to_string());
                    }
                    valid_end -= 1;
                }

                let hex_data = buffer[0..n]
                    .iter()
                    .map(|b| format!("\\x{:02x}", b))
                    .collect::<Vec<String>>()
                    .join("");

                Ok(hex_data)
            }
        }
        Err(e) => {
            println!("Terminal read error for {}: {}", email, e);
            Err(e)
        }
    }
}
