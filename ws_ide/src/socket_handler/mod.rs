pub mod completion_events;
pub mod file_events;
pub mod load_terminal;
pub mod pseudo_terminal;
pub mod repo_events;
pub mod terminal_events;

use socketioxide::{
    extract::{Data, SocketRef},
    SocketIo,
};

use crate::{
    events,
    state::AppState,
    types::{
        CloseTerminalPayload, CompletionPayload, FileContentPayload, LoadTerminalPayload,
        RepoTreePayload, SaveFileContentPayload, TerminalInputPayload, TerminalResizePayload,
    },
};

use self::{
    completion_events::handle_code_completion,
    file_events::{get_file_data, save_file_data},
    load_terminal::load_terminal,
    repo_events::get_repo_structure,
    terminal_events::{handle_close_terminal, handle_terminal_input, handle_terminal_resize},
};

pub fn register_handlers(io: &SocketIo, state: AppState) {
    io.ns("/", move |s: SocketRef| {
        println!("New connection: {:?}", s.id);

        s.on(
            events::incoming::MESSAGE,
            |s: SocketRef, Data::<String>(data): Data<String>| {
                println!("Received message: {}", data);
                s.emit(events::outgoing::MESSAGE_BACK, "Hello from server!").ok();
            },
        );

        let st = state.clone();
        s.on(events::incoming::LOAD_TERMINAL, {
            let st = st.clone();
            move |s: SocketRef, Data::<LoadTerminalPayload>(p): Data<LoadTerminalPayload>| {
                let st = st.clone();
                let socket_id = s.id;
                st.socket_mapping.insert(s.id, p.email.clone());
                st.email_mapping.insert(p.email.clone(), s.id);
                Box::pin(async move {
                    load_terminal(&s, socket_id, st, p.email, p.terminal_id).await;
                })
            }
        });

        let st = state.clone();
        s.on(events::incoming::TERMINAL_INPUT, {
            let st = st.clone();
            move |s: SocketRef, Data::<TerminalInputPayload>(p): Data<TerminalInputPayload>| {
                let st = st.clone();
                Box::pin(async move {
                    if let Err(e) = handle_terminal_input(&s, st, p).await {
                        eprintln!("terminal_input: {}", e);
                    }
                })
            }
        });

        let st = state.clone();
        s.on(events::incoming::TERMINAL_RESIZE, {
            let st = st.clone();
            move |s: SocketRef, Data::<TerminalResizePayload>(p): Data<TerminalResizePayload>| {
                let st = st.clone();
                Box::pin(async move {
                    if let Err(e) = handle_terminal_resize(&s, st, p).await {
                        eprintln!("terminal_resize: {}", e);
                    }
                })
            }
        });

        let st = state.clone();
        s.on(events::incoming::REPO_TREE, {
            let st = st.clone();
            move |s: SocketRef, Data::<RepoTreePayload>(p): Data<RepoTreePayload>| {
                let st = st.clone();
                Box::pin(async move {
                    if let Err(e) = get_repo_structure(&s, st, p.email, p.path).await {
                        eprintln!("repo_tree: {}", e);
                    }
                })
            }
        });

        let st = state.clone();
        s.on(events::incoming::GET_FILES_DATA, {
            let st = st.clone();
            move |s: SocketRef, Data::<FileContentPayload>(p): Data<FileContentPayload>| {
                let st = st.clone();
                Box::pin(async move {
                    if let Err(e) = get_file_data(s, st, p).await {
                        eprintln!("get_files_data: {}", e);
                    }
                })
            }
        });

        let st = state.clone();
        s.on(events::incoming::SAVE_DATA, {
            let st = st.clone();
            move |s: SocketRef, Data::<SaveFileContentPayload>(p): Data<SaveFileContentPayload>| {
                let st = st.clone();
                Box::pin(async move {
                    if let Err(e) = save_file_data(s, st, p).await {
                        eprintln!("save_data: {}", e);
                    }
                })
            }
        });

        let st = state.clone();
        s.on(events::incoming::CLOSE_TERMINAL, {
            let st = st.clone();
            move |s: SocketRef, Data::<CloseTerminalPayload>(p): Data<CloseTerminalPayload>| {
                let st = st.clone();
                Box::pin(async move {
                    if let Err(e) = handle_close_terminal(&s, st, p).await {
                        eprintln!("close_terminal: {}", e);
                    }
                })
            }
        });

        s.on(events::incoming::CODE_COMPLETION, {
            move |s: SocketRef, Data::<CompletionPayload>(p): Data<CompletionPayload>| {
                Box::pin(async move {
                    handle_code_completion(s, p).await;
                })
            }
        });

        let st = state.clone();
        s.on_disconnect(move |s: SocketRef| {
            let socket_id = s.id;
            if let Some((_, email)) = st.socket_mapping.remove(&socket_id) {
                st.email_mapping.remove(&email);
                let prefix = format!("{}:", email);
                st.terminal_mapping.retain(|k, _| !k.starts_with(&prefix));
                st.back_terminal_mapping.remove(&email);
                st.docker_container_id.remove(&email);
            }
            println!("Socket disconnected: {:?}", socket_id);
        });
    });
}
