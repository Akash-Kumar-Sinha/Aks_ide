use serde::{Deserialize, Serialize};

fn default_terminal_id() -> String {
    "t1".to_string()
}

#[derive(Debug, Clone, Deserialize)]
pub struct LoadTerminalPayload {
    pub email: String,
    #[serde(default = "default_terminal_id", alias = "terminalId")]
    pub terminal_id: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RepoTreePayload {
    pub email: String,
    pub path: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TerminalInputPayload {
    pub email: String,
    pub data: String,
    #[serde(default = "default_terminal_id", alias = "terminalId")]
    pub terminal_id: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct TerminalResizePayload {
    pub email: String,
    pub rows: u16,
    pub cols: u16,
    #[serde(default = "default_terminal_id", alias = "terminalId")]
    pub terminal_id: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CloseTerminalPayload {
    pub email: String,
    #[serde(default = "default_terminal_id", alias = "terminalId")]
    pub terminal_id: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct TerminalDataPayload {
    pub terminal_id: String,
    pub data: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct TerminalStatusPayload {
    pub terminal_id: String,
    pub message: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct FileContentPayload {
    pub email: String,
    pub path: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SaveFileContentPayload {
    pub email: String,
    pub path: String,
    pub content: String,
}
