pub mod incoming {
    pub const MESSAGE: &str = "message";
    pub const LOAD_TERMINAL: &str = "load_terminal";
    pub const TERMINAL_INPUT: &str = "terminal_input";
    pub const TERMINAL_RESIZE: &str = "terminal_resize";
    pub const REPO_TREE: &str = "repo_tree";
    pub const GET_FILES_DATA: &str = "get_files_data";
    pub const SAVE_DATA: &str = "save_data";
    pub const CLOSE_TERMINAL: &str = "close_terminal";
    pub const CODE_COMPLETION: &str = "code_completion";
}

pub mod outgoing {
    pub const MESSAGE_BACK: &str = "message-back";
    pub const TERMINAL_LOADING: &str = "terminal_loading";
    pub const TERMINAL_ERROR: &str = "terminal_error";
    pub const TERMINAL_INFO: &str = "terminal_info";
    pub const TERMINAL_SUCCESS: &str = "terminal_success";
    pub const TERMINAL_CLOSED: &str = "terminal_closed";
    pub const TERMINAL_DATA: &str = "terminal_data";
    pub const TERMINAL_CWD: &str = "terminal_cwd";
    pub const FILE_ERROR: &str = "file_error";
    pub const FILES_DATA: &str = "files_data";
    pub const FILE_SAVED: &str = "file_saved";
    pub const REPO_STRUCTURE: &str = "repo_structure";
    pub const COMPLETION_RESULT: &str = "completion_result";
    pub const COMPLETION_ERROR: &str = "completion_error";
}
