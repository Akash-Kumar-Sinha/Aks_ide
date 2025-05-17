use bollard::container::StartContainerOptions;
use bollard::Docker;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use socketioxide::socket::Sid;

use crate::{
    docker_vm::create_container::create_container, entities::profile,
    socket_handler::pseudo_terminal::pseudo_terminal, AppState,
};

pub async fn load_terminal(id: Sid, state: AppState, email: String) {
    println!("🔧 Loading terminal for user: {}", email);

    // Emit initial terminal loading message
    state.socket_io.to(id).emit("terminal_loading", "Connecting to your development environment...").await.ok();

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
                    eprintln!("❌ Failed to connect to Docker: {}", e);
                    state.socket_io.to(id).emit("terminal_error", &format!("Failed to connect to Docker: {}", e)).await.ok();
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
                            println!("✅ Container `{}` started successfully", &container_id);
                            docker_container_id = Some(container_id.to_string());
                        }
                        Err(e) => {
                            println!("⚠️ Failed to start existing container: {}. Creating new one...", e);
                            state.socket_io.to(id).emit("terminal_info", "Creating a new development environment...").await.ok();
                            docker_container_id = create_container(id, state.clone(), email).await;
                        }
                    }
                    if docker_container_id.is_some() {
                        println!(
                            "🚀 Container `{}` started successfully",
                            docker_container_id.as_ref().unwrap()
                        );
                        
                        // Emit container ready message
                        state.socket_io.to(id).emit("terminal_info", &format!(
                            "Container {} ready. Starting terminal session...", 
                            docker_container_id.as_ref().unwrap()
                        )).await.ok();
                        
                        // Start the pseudo-terminal with the container ID
                        match pseudo_terminal(docker_container_id.clone(), state.clone()).await {
                            Ok(_) => {
                                // Success is handled by pseudo_terminal function (it emits terminal_success)
                            },
                            Err(e) => {
                                state.socket_io.to(id).emit("terminal_error", &format!("Failed to start terminal: {}", e)).await.ok();
                            }
                        }
                    }
                }
                None => {
                    eprintln!("⚠️ User `{}` has no container ID assigned", email);
                    state.socket_io.to(id).emit("terminal_info", "Creating new development environment...").await.ok();
                    
                    docker_container_id = create_container(id, state.clone(), email).await;
                    if docker_container_id.is_some() {
                        println!(
                            "🚀 Container `{}` started successfully",
                            docker_container_id.as_ref().unwrap()
                        );
                        
                        // Emit container ready message
                        state.socket_io.to(id).emit("terminal_info", &format!(
                            "Container {} ready. Starting terminal session...", 
                            docker_container_id.as_ref().unwrap()
                        )).await.ok();
                        
                        // Start the pseudo-terminal with the container ID
                        match pseudo_terminal(docker_container_id.clone(), state.clone()).await {
                            Ok(_) => {
                                // Success is handled by pseudo_terminal function
                            },
                            Err(e) => {
                                state.socket_io.to(id).emit("terminal_error", &format!("Failed to start terminal: {}", e)).await.ok();
                            }
                        }
                    } else {
                        state.socket_io.to(id).emit("terminal_error", "Failed to create container").await.ok();
                    }
                }
            }
        }
        Ok(None) => {
            eprintln!("⚠️ No user found with email: {}", email);
            state.socket_io.to(id).emit("terminal_error", &format!("No user found with email: {}", email)).await.ok();
        }
        Err(e) => {
            eprintln!("❌ DB error when finding user: {}", e);
            state.socket_io.to(id).emit("terminal_error", &format!("Database error: {}", e)).await.ok();
        }
    }
}