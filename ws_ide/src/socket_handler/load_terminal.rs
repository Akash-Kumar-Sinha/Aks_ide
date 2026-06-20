use bollard::container::StartContainerOptions;
use bollard::Docker;
use sea_orm::{ColumnTrait, EntityTrait, Order, QueryFilter, QueryOrder};
use socketioxide::{extract::SocketRef, socket::Sid};

use crate::{
    docker_vm::create_container::create_container,
    entities::{users, workspace_containers},
    events,
    socket_handler::pseudo_terminal::pseudo_terminal,
    state::AppState,
    types::TerminalStatusPayload,
};

pub async fn load_terminal(
    s: &SocketRef,
    id: Sid,
    state: AppState,
    email: String,
    terminal_id: String,
) {
    s.emit(events::outgoing::TERMINAL_LOADING, &TerminalStatusPayload {
        terminal_id: terminal_id.clone(),
        message: "Connecting to your development environment".to_string(),
    })
    .ok();

    let user = match users::Entity::find()
        .filter(users::Column::Email.eq(email.clone()))
        .one(&*state.db)
        .await
    {
        Ok(Some(u)) => u,
        Ok(None) => {
            eprintln!("[terminal] No user found for email={}", email);
            s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload {
                terminal_id: terminal_id.clone(),
                message: format!("No user found with email: {}", email),
            })
            .ok();
            return;
        }
        Err(e) => {
            eprintln!("[terminal] DB error: {}", e);
            s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload {
                terminal_id: terminal_id.clone(),
                message: format!("Database error: {}", e),
            })
            .ok();
            return;
        }
    };

    let container_row = match workspace_containers::Entity::find()
        .filter(workspace_containers::Column::UserId.eq(user.id))
        .filter(workspace_containers::Column::DeletedAt.is_null())
        .order_by(workspace_containers::Column::CreatedAt, Order::Desc)
        .one(&*state.db)
        .await
    {
        Ok(row) => row,
        Err(e) => {
            eprintln!("[terminal] DB error querying workspace_containers: {}", e);
            s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload {
                terminal_id: terminal_id.clone(),
                message: format!("Database error: {}", e),
            })
            .ok();
            return;
        }
    };

    let docker_container_id: Option<String> = match container_row {
        Some(row) => {
            let docker = match Docker::connect_with_socket_defaults() {
                Ok(client) => client,
                Err(e) => {
                    s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload {
                        terminal_id: terminal_id.clone(),
                        message: format!("Failed to connect to Docker: {}", e),
                    })
                    .ok();
                    return;
                }
            };

            match docker
                .start_container(&row.container_id, None::<StartContainerOptions<String>>)
                .await
            {
                Ok(_) => Some(row.container_id),
                Err(_) => create_container(s, id, state.clone(), email.clone()).await,
            }
        }
        None => create_container(s, id, state.clone(), email.clone()).await,
    };

    if let Some(ref cid) = docker_container_id {
        s.emit(events::outgoing::TERMINAL_INFO, &format!("Container {} ready. Starting terminal session", cid))
            .ok();

        state.docker_container_id.insert(email.clone(), cid.clone());

        if let Err(e) = pseudo_terminal(s, docker_container_id, state, email, terminal_id.clone()).await {
            eprintln!("[terminal] pseudo_terminal error: {}", e);
            s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload {
                terminal_id: terminal_id.clone(),
                message: format!("Failed to start terminal: {}", e),
            })
            .ok();
        }
    } else {
        s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload {
            terminal_id: terminal_id.clone(),
            message: "Failed to initialize container".to_string(),
        })
        .ok();
    }
}
