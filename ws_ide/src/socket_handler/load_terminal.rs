use bollard::container::StartContainerOptions;
use bollard::Docker;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use socketioxide::{extract::SocketRef, socket::Sid};
use std::option::Option;

use crate::{
    docker_vm::create_container::create_container, entities::profile,
    socket_handler::pseudo_terminal::pseudo_terminal, AppState,
};

pub async fn load_terminal(s: &SocketRef, id: Sid, state: AppState, email: String) {
    s.emit(
        "terminal_loading",
        "Connecting to your development environment",
    )
    .ok();

    let docker_container_id: Option<String>;
    match profile::Entity::find()
        .filter(profile::Column::Email.eq(email.clone()))
        .one(&*state.db)
        .await
    {
        Ok(Some(user)) => {
            let docker = match Docker::connect_with_socket_defaults() {
                Ok(client) => client,
                Err(e) => {
                    eprintln!("Failed to connect to Docker: {}", e);
                    s.emit(
                        "terminal_error",
                        &format!("Failed to connect to Docker: {}", e),
                    )
                    .ok();
                    return;
                }
            };

            match &user.docker_container_id {
                Some(container_id) => {
                    match docker
                        .start_container(container_id, None::<StartContainerOptions<String>>)
                        .await
                    {
                        Ok(_) => {
                            docker_container_id = Some(container_id.to_string());
                        }
                        Err(e) => {
                            println!(
                                " Failed to start existing container: {}. Creating new one",
                                e
                            );
                            s.emit("terminal_info", "Creating a new development environment")
                                .ok();
                            docker_container_id =
                                create_container(&s, id, state.clone(), email.clone()).await;
                        }
                    }
                    if docker_container_id.is_some() {
                        s.emit(
                            "terminal_info",
                            &format!(
                                "Container {} ready. Starting terminal session",
                                docker_container_id.as_ref().unwrap()
                            ),
                        )
                        .ok();
                        state
                            .docker_container_id
                            .lock()
                            .unwrap()
                            .insert(email.clone(), docker_container_id.clone());                    
                                                            
                        match pseudo_terminal(
                            &s,
                            docker_container_id.clone(),
                            state.clone(),
                            email.clone(),
                        )
                        .await
                        {
                            Ok(_) => {}
                            Err(e) => {
                                s.emit(
                                    "terminal_error",
                                    &format!("Failed to start terminal: {}", e),
                                )
                                .ok();
                            }
                        }
                    }
                }
                None => {
                    eprintln!("User `{}` has no container ID assigned", email);
                    s.emit("terminal_info", "Creating new development environment")
                        .ok();

                    docker_container_id =
                        create_container(&s, id, state.clone(), email.clone()).await;
                    if docker_container_id.is_some() {
                        s.emit(
                            "terminal_info",
                            &format!(
                                "Container {} ready. Starting terminal session",
                                docker_container_id.as_ref().unwrap()
                            ),
                        )
                        .ok();
                        // state
                        //     .docker_container_id
                        //     .lock()
                        //     .unwrap()
                        //     .insert
                           

                        match pseudo_terminal(
                            s,
                            docker_container_id.clone(),
                            state.clone(),
                            email.clone(),
                        )
                        .await
                        {
                            Ok(_) => {}
                            Err(e) => {
                                s.emit(
                                    "terminal_error",
                                    &format!("Failed to start terminal: {}", e),
                                )
                                .ok();
                            }
                        }
                    } else {
                        s.emit("terminal_error", "Failed to create container").ok();
                    }
                }
            }
        }
        Ok(None) => {
            eprintln!("No user found with email: {}", email);
            s.emit(
                "terminal_error",
                &format!("No user found with email: {}", email),
            )
            .ok();
        }
        Err(e) => {
            eprintln!("DB error when finding user: {}", e);
            s.emit("terminal_error", &format!("Database error: {}", e))
                .ok();
        }
    }
}
