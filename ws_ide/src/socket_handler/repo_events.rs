use crate::socket_handler::pseudo_terminal::pseudo_back_terminal;
use crate::{AppState, CreateProjectPayload, LoadTerminalPayload};
use regex::Regex;
use serde_json::{json, Value};
use socketioxide::extract::SocketRef;
use std::boxed::Box;
use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use tokio::io::AsyncReadExt;
use tokio::time::{timeout, Duration};
    use std::io::Write;

pub async fn get_repo_structure(
    s: &SocketRef,
    state: AppState,
    payload: LoadTerminalPayload,
) -> Result<(), std::io::Error> {
    let email = payload.email.clone();
    println!("Getting repo structure for email: {}", email);

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

    println!("Current working directory for {}: {}", email, pwd);

    let mut repo_info = HashMap::new();
    repo_info.insert("current_directory".to_string(), json!(pwd));

    match build_comprehensive_file_tree(&email, &state, &pwd).await {
        Ok(tree) => {
            repo_info.insert("structure".to_string(), json!(tree));
            println!(
                "Built comprehensive file tree for {}: {:#?}",
                email, repo_info
            );
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
    println!("Creating new project for email: {}", email);  
    // Clone terminal handle safely
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

    // Sanitize project name
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

    // Write safe shell commands
    writeln!(terminal_file, "cd /home")?;
    writeln!(terminal_file, "mkdir {}", sanitized_name)?;

    // Optional: sleep to allow shell time to process commands
    tokio::time::sleep(std::time::Duration::from_millis(100)).await;
    terminal_file.flush()?;

    // Emit success response back to client
    s.emit("repo_created", &payload.project_name).ok();
    get_repo_structure(&s, state, LoadTerminalPayload { email }).await?;        

    Ok(())
}


// Function to strip ANSI color codes from text
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
            println!("Raw pwd output for {}: {:?}", email, output);

            let clean_output = strip_ansi_codes(&output);
            println!("Clean pwd output for {}: {:?}", email, clean_output);

            let lines: Vec<&str> = clean_output
                .lines()
                .filter(|l| !l.trim().is_empty() && !l.contains("pwd"))
                .filter(|l| !l.starts_with("root@") && !l.contains("#"))
                .collect();

            println!("Filtered pwd lines for {}: {:?}", email, lines);

            if let Some(pwd_line) = lines.first() {
                Ok(pwd_line.trim().to_string())
            } else {
                Ok("/".to_string())
            }
        }
        _ => Ok("/".to_string()),
    }
}

// FIXED: New comprehensive file tree builder with flat structure
async fn build_comprehensive_file_tree(
    email: &str,
    state: &AppState,
    base_path: &str,
) -> Result<HashMap<String, Value>, std::io::Error> {
    println!(
        "Building comprehensive file tree for {}: base_path={}",
        email, base_path
    );

    build_directory_tree(email, state, base_path, "root", 0, 3).await
}

// FIXED: Get items in a directory using ls -la for proper file type detection
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
    println!(
        "Getting directory items with command: {}",
        ls_command.trim()
    );

    terminal_file.write_all(ls_command.as_bytes())?;
    terminal_file.flush()?;

    tokio::time::sleep(Duration::from_millis(200)).await;

    let output = match timeout(
        Duration::from_millis(1500),
        read_terminal_output(email.to_string(), state.clone()),
    )
    .await
    {
        Ok(Ok(output)) => {
            println!("Raw ls -la output: {:?}", output);
            output
        }
        Ok(Err(e)) => {
            println!("Error reading directory items: {}", e);
            return Ok(Vec::new());
        }
        Err(_) => {
            println!("Timeout reading directory items");
            return Ok(Vec::new());
        }
    };

    let clean_output = strip_ansi_codes(&output);
    println!("Clean directory listing: {:?}", clean_output);

    let mut items = Vec::new();
    let lines: Vec<&str> = clean_output
        .lines()
        .filter(|l| !l.trim().is_empty())
        .filter(|l| !l.contains("ls -la") && !l.starts_with("root@") && !l.contains("#"))
        .filter(|l| !l.starts_with("total "))
        .collect();

    println!("Filtered directory lines: {:?}", lines);

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

        // if filename.starts_with('.')
        //     && !matches!(
        //         filename.as_str(),
        //         ".env" | ".gitignore" | ".dockerignore" | ".editorconfig"
        //     )
        // {
        //     continue;
        // }

        // if matches!(
        //     filename.as_str(),
        //     "node_modules" | ".git" | "__pycache__" | ".cache"
        // ) {
        //     continue;
        // }

        let is_dir = permissions.starts_with('d');

        println!(
            "Parsed item: {} -> {} (permissions: {})",
            filename,
            if is_dir { "DIR" } else { "FILE" },
            permissions
        );
        items.push((filename, is_dir));
    }

    println!("Final items list: {:?}", items);
    Ok(items)
}

// FIXED: Build directory tree with flat structure - directories and files mixed together
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
            println!(
                "Reached max depth {} for directory: {}",
                max_depth, dir_name
            );
            return Ok(HashMap::new());
        }

        println!(
            "Building directory tree for: {} at depth {}",
            dir_name, current_depth
        );

        let items = match get_directory_items(email, state, full_path).await {
            Ok(items) => items,
            Err(e) => {
                println!("Failed to get items for {}: {}", dir_name, e);
                return Ok(HashMap::new());
            }
        };

        let mut tree = HashMap::new();
        let mut directories = Vec::new();
        let mut files = Vec::new();

        for (name, is_dir) in items {
            if is_dir {
                directories.push(name);
            } else {
                files.push(name);
            }
        }

        directories.sort();
        files.sort();

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

        if !files.is_empty() {
            let limited_files: Vec<String> = if files.clone().len() > 15 {
                let mut limited = files.clone().into_iter().take(10).collect::<Vec<_>>();
                limited.push(format!("... and {} more files", files.clone().len() - 10));
                limited
            } else {
                files
            };

            tree.insert("_files".to_string(), json!(limited_files));
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
            println!("Terminal session ended for {}", email);

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
                println!("Received binary data for {}: {}", email, hex_data);
                Ok(hex_data)
            }
        }
        Err(e) => {
            println!("Terminal read error for {}: {}", email, e);
            Err(e)
        }
    }
}
