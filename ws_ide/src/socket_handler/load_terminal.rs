use bollard::container::StartContainerOptions;
use bollard::Docker;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};

use crate::{
    docker_vm::create_container::{self, create_container}, entities::profile, socket_handler::start_pty_process::{self, start_pty_process}, AppState
};

pub async fn load_terminal(id: u32, state: AppState, email: String) {
    println!("🔧 Loading terminal for user: {}", email);

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
                            docker_container_id = create_container(id, state.clone(), email).await;
                        }
                    }
                    if docker_container_id.is_some() {
                        start_pty_process(docker_container_id, state).await;
                    }
                }
                None => {
                    eprintln!("⚠️ User `{}` has no container ID assigned", email);
                }
            }
        }
        Ok(None) => {
            eprintln!("⚠️ No user found with email: {}", email);
        }
        Err(e) => {
            eprintln!("❌ DB error when finding user: {}", e);
        }
    }
}
