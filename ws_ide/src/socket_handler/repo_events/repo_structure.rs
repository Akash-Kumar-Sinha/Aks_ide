use crate::{events, state::AppState};
use serde_json::{json, Value};
use socketioxide::extract::SocketRef;
use std::collections::HashMap;
use std::process::Command;

pub async fn get_repo_structure(
    s: &SocketRef,
    state: AppState,
    email: String,
    path: Option<String>,
) -> Result<(), std::io::Error> {
    let pwd = path.unwrap_or_else(|| "/".to_string());
    let mut repo_info: HashMap<String, Value> = HashMap::new();
    repo_info.insert("current_directory".to_string(), json!(pwd));

    let raw_items = get_directory_items(&email, &state, &pwd).await?;

    let items: Vec<Value> = raw_items
        .into_iter()
        .map(|(name, is_dir)| {
            let item_path = format!("{}/{}", pwd.trim_end_matches('/'), name);
            json!({ "name": name, "is_dir": is_dir, "path": item_path })
        })
        .collect();

    repo_info.insert("items".to_string(), json!(items));
    s.emit(events::outgoing::REPO_STRUCTURE, &repo_info).ok();

    Ok(())
}

async fn get_directory_items(
    email: &str,
    state: &AppState,
    path: &str,
) -> Result<Vec<(String, bool)>, std::io::Error> {
    let container_id = match state.docker_container_id.get(email).map(|r| r.clone()) {
        Some(id) => id,
        None => return Ok(Vec::new()),
    };

    let output = match Command::new("docker")
        .arg("exec")
        .arg(&container_id)
        .arg("ls")
        .arg("-la")
        .arg("--color=never")
        .arg(path)
        .output()
    {
        Ok(o) if o.status.success() => o,
        _ => return Ok(Vec::new()),
    };

    let content = String::from_utf8_lossy(&output.stdout);
    let mut items = Vec::new();

    for line in content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with("total ") {
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

        // Filter Linux virtual filesystems only - let node_modules, .git etc. through
        if matches!(filename.as_str(), "proc" | "sys" | "dev" | "run") {
            continue;
        }

        let is_dir = permissions.starts_with('d');
        items.push((filename, is_dir));
    }

    items.sort_by(|(a_name, a_dir), (b_name, b_dir)| b_dir.cmp(a_dir).then(a_name.cmp(b_name)));

    Ok(items)
}
