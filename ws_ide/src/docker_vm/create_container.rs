use bollard::container::{Config, CreateContainerOptions, InspectContainerOptions, StartContainerOptions};
use bollard::image::CreateImageOptions;
use bollard::models::HostConfig;
use bollard::Docker;
use futures_util::stream::TryStreamExt;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, Set};
use socketioxide::extract::SocketRef;
use socketioxide::socket::Sid;
use uuid::Uuid;

use crate::entities::{users, workspace_containers};
use crate::events;
use crate::state::AppState;
use crate::types::TerminalStatusPayload;

const IMAGE: &str = "ubuntu:20.04";

pub async fn create_container(
    s: &SocketRef,
    _id: Sid,
    state: AppState,
    email: String,
    terminal_id: String,
) -> Option<String> {
    println!(
        "[container] Creating dev container for {} using image {}",
        email, IMAGE
    );

    println!("[container] Step 1: connecting to Docker daemon");
    let docker = match Docker::connect_with_socket_defaults() {
        Ok(client) => {
            println!("[container] Step 1 OK: Docker daemon connected");
            client
        }
        Err(e) => {
            eprintln!("[container] Step 1 FAIL: cannot reach Docker - {}", e);
            s.emit(
                events::outgoing::TERMINAL_ERROR,
                &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: format!("Failed to connect to Docker: {}", e) },
            )
            .ok();
            return None;
        }
    };

    println!("[container] Step 2: pulling image `{}`", IMAGE);
    s.emit(
        events::outgoing::TERMINAL_INFO,
        &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: "Pulling Ubuntu image, this may take a moment".to_string() },
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
            println!("[container] Step 2 OK: image `{}` ready", IMAGE);
            s.emit(
                events::outgoing::TERMINAL_INFO,
                &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: "Image pulled successfully. Creating container".to_string() },
            )
            .ok();
        }
        Err(e) => {
            eprintln!("[container] Step 2 FAIL: could not pull image - {}", e);
            s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: format!("Failed to pull image: {}", e) })
                .ok();
            return None;
        }
    }

    let container_name = format!(
        "dev-env-{}",
        email
            .chars()
            .map(|c| if c.is_alphanumeric() { c } else { '-' })
            .collect::<String>()
    );
    println!(
        "[container] Step 3: creating container name={} image={}",
        container_name, IMAGE
    );

    let container_config = Config {
        image: Some(IMAGE),
        tty: Some(true),
        cmd: Some(vec!["/bin/bash", "-c", "sleep infinity"]),
        attach_stdin: Some(true),
        attach_stdout: Some(true),
        attach_stderr: Some(true),
        open_stdin: Some(true),
        host_config: Some(HostConfig {
            publish_all_ports: Some(true),
            ..Default::default()
        }),
        ..Default::default()
    };

    // Check if a container with this name already exists
    if let Ok(info) = docker
        .inspect_container(&container_name, None::<InspectContainerOptions>)
        .await
    {
        let existing_id = info.id.clone().unwrap_or_default();
        let running = info.state.as_ref().and_then(|s| s.running).unwrap_or(false);
        println!(
            "[container] Step 3: container already exists id={} running={}",
            existing_id, running
        );
        if !running {
            println!("[container] Step 3: starting stopped container id={}", existing_id);
            if let Err(e) = docker
                .start_container(&existing_id, None::<StartContainerOptions<String>>)
                .await
            {
                eprintln!("[container] Step 3 FAIL: could not restart container - {}", e);
                s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: format!("Failed to restart container: {}", e) }).ok();
                return None;
            }
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        }
        s.emit(events::outgoing::TERMINAL_INFO, &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: "Reconnecting to existing workspace container".to_string() }).ok();
        println!("[container] ── reusing existing container, returning id={}", existing_id);
        return Some(existing_id);
    }

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
            println!(
                "[container] Step 3 OK: container created - id={}",
                container.id
            );
            s.emit(
                events::outgoing::TERMINAL_INFO,
                &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: "Container created successfully. Starting container".to_string() },
            )
            .ok();
            container
        }
        Err(e) => {
            eprintln!(
                "[container] Step 3 FAIL: could not create container - {}",
                e
            );
            s.emit(
                events::outgoing::TERMINAL_ERROR,
                &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: format!("Failed to create container: {}", e) },
            )
            .ok();
            return None;
        }
    };

    println!("[container] Step 4: starting container id={}", container.id);
    match docker
        .start_container(&container.id, None::<StartContainerOptions<String>>)
        .await
    {
        Ok(_) => {
            println!(
                "[container] Step 4 OK: container running - id={}",
                container.id
            );
            s.emit(
                events::outgoing::TERMINAL_INFO,
                &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: "Container started successfully. Setting up workspace".to_string() },
            )
            .ok();
            println!("[container] Step 4: waiting 500ms for container to stabilise");
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
            println!("[container] Step 4: container ready");
        }
        Err(e) => {
            eprintln!("[container] Step 4 FAIL: could not start container - {}", e);
            s.emit(
                events::outgoing::TERMINAL_ERROR,
                &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: format!("Failed to start container: {}", e) },
            )
            .ok();
            return None;
        }
    }

    // Find user by email then record the container in workspace_containers
    println!(
        "[container] Step 5: looking up user by email={} to store container record",
        email
    );
    match users::Entity::find()
        .filter(users::Column::Email.eq(email.clone()))
        .one(&*state.db)
        .await
    {
        Ok(Some(user)) => {
            println!(
                "[container] Step 5 OK: found user id={}, inserting into workspace_containers",
                user.id
            );
            let new_entry = workspace_containers::ActiveModel {
                id: Set(Uuid::new_v4()),
                user_id: Set(user.id),
                container_id: Set(container.id.clone()),
                image_name: Set(IMAGE.to_string()),
                status: Set("running".to_string()),
                ..Default::default()
            };
            match workspace_containers::Entity::insert(new_entry)
                .exec(&*state.db)
                .await
            {
                Ok(_) => {
                    println!(
                        "[container] Step 5 OK: stored container={} → user={}",
                        container.id, user.id
                    );
                    s.emit(
                        events::outgoing::TERMINAL_INFO,
                        &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: "Workspace recorded. Container ready for terminal session.".to_string() },
                    )
                    .ok();
                }
                Err(e) => {
                    eprintln!(
                        "[container] Step 5 FAIL: could not insert workspace_containers row - {}",
                        e
                    );
                    s.emit(
                        events::outgoing::TERMINAL_ERROR,
                        &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: format!("Failed to record workspace: {}", e) },
                    )
                    .ok();
                }
            }
        }
        Ok(None) => {
            eprintln!("[container] Step 5 FAIL: no user found for email={}", email);
            s.emit(
                events::outgoing::TERMINAL_ERROR,
                &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: format!("No user found with email: {}", email) },
            )
            .ok();
            return None;
        }
        Err(e) => {
            eprintln!("[container] Step 5 FAIL: DB error looking up user - {}", e);
            s.emit(events::outgoing::TERMINAL_ERROR, &TerminalStatusPayload { terminal_id: terminal_id.clone(), message: format!("Database error: {}", e) })
                .ok();
            return None;
        }
    }

    println!(
        "[container] ── create_container done, returning id={}",
        container.id
    );
    Some(container.id)
}
