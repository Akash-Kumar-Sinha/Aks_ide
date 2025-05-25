use bollard::container::{Config, CreateContainerOptions, StartContainerOptions};
use bollard::image::CreateImageOptions;
use bollard::Docker;
use futures_util::stream::TryStreamExt;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use socketioxide::extract::SocketRef;
use socketioxide::socket::Sid;

use crate::entities::profile;
use crate::AppState;

const IMAGE: &str = "ubuntu:20.04";

pub async fn create_container(
    s: &SocketRef,
    id: Sid,
    state: AppState,
    email: String,
) -> Option<String> {
    println!(
        "🔧 Creating container for user: {} with socket ID: {:?}",
        email, id
    );

    let docker = match Docker::connect_with_socket_defaults() {
        Ok(client) => client,
        Err(e) => {
            eprintln!(" Failed to connect to Docker: {}", e);
            s.emit(
                "terminal_error",
                &format!("Failed to connect to Docker: {}", e),
            )
            .ok();
            return None;
        }
    };

    s.emit(
        "terminal_info",
        "Pulling Ubuntu image, this may take a moment",
    )
    .ok();

    let image_pull_result = docker
        .create_image(
            Some(CreateImageOptions {
                from_image: IMAGE,
                ..Default::default()
            }),
            None,
            None,
        )
        .try_collect::<Vec<_>>()
        .await;

    match image_pull_result {
        Ok(_) => {
            println!("Image `{}` pulled successfully", IMAGE);
            s.emit(
                "terminal_info",
                "Image pulled successfully. Creating container",
            )
            .ok();
        }
        Err(e) => {
            s.emit("terminal_error", &format!("Failed to pull image: {}", e))
                .ok();
            return None;
        }
    }

    let container_config = Config {
        image: Some(IMAGE),
        tty: Some(true),
        cmd: Some(vec!["/bin/bash"]),
        attach_stdin: Some(true),
        attach_stdout: Some(true),
        attach_stderr: Some(true),
        open_stdin: Some(true),
        ..Default::default()
    };

    let container_name = format!(
        "dev-env-{}",
        email
            .chars()
            .map(|c| if c.is_alphanumeric() { c } else { '-' })
            .collect::<String>()
    );

    let create_result = docker
        .create_container(
            Some(CreateContainerOptions {
                name: container_name.clone(),
                platform: Some("linux/amd64".to_string()),
            }),
            container_config,
        )
        .await;

    let container = match create_result {
        Ok(container) => {
            println!("Container created successfully: {}", container.id);
            s.emit(
                "terminal_info",
                "Container created successfully. Starting container",
            )
            .ok();
            container
        }
        Err(e) => {
            eprintln!(" Failed to create container: {}", e);
            s.emit(
                "terminal_error",
                &format!("Failed to create container: {}", e),
            )
            .ok();
            return None;
        }
    };

    match docker
        .start_container(&container.id, None::<StartContainerOptions<String>>)
        .await
    {
        Ok(_) => {
            println!("Container started successfully: {}", container.id);
            s.emit(
                "terminal_info",
                "Container started successfully. Updating user profile",
            )
            .ok();
        }
        Err(e) => {
            eprintln!(" Failed to start container: {}", e);
            s.emit(
                "terminal_error",
                &format!("Failed to start container: {}", e),
            )
            .ok();
            return None;
        }
    }

    match profile::Entity::find()
        .filter(profile::Column::Email.eq(email.clone()))
        .one(&*state.db)
        .await
    {
        Ok(Some(user)) => {
            let mut model: profile::ActiveModel = user.into();
            model.docker_container_id = Set(Some(container.id.clone()));

            match model.update(&*state.db).await {
                Ok(_) => {
                    println!("Updated user's container_id in database");
                    s.emit(
                        "terminal_info",
                        "Profile updated. Container ready for terminal session.",
                    )
                    .ok();
                }
                Err(e) => {
                    s.emit(
                        "terminal_error",
                        &format!("Failed to update profile: {}", e),
                    )
                    .ok();
                }
            }
        }
        Ok(None) => {
            eprintln!(" No user found with email: {}", email);
            s.emit(
                "terminal_error",
                &format!("No user found with email: {}", email),
            )
            .ok();
            return None;
        }
        Err(e) => {
            eprintln!(" DB error when finding user: {}", e);
            s.emit("terminal_error", &format!("Database error: {}", e))
                .ok();
            return None;
        }
    }

    Some(container.id)
}
