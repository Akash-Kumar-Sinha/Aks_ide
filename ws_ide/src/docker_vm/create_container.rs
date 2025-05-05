use bollard::container::{Config, CreateContainerOptions, StartContainerOptions};
use bollard::image::CreateImageOptions;
use bollard::Docker;
use futures_util::stream::TryStreamExt;
use sea_orm::{EntityTrait, Set, ColumnTrait, QueryFilter, ActiveModelTrait};

use crate::entities::profile;
use crate::AppState;

const IMAGE: &str = "ubuntu:20.04";

pub async fn create_container(id: u32, state: AppState, email: String) -> Option<String> {
    let docker = match Docker::connect_with_socket_defaults() {
        Ok(client) => client,
        Err(e) => {
            eprintln!("❌ Failed to connect to Docker: {}", e);
            return None;
        }
    };

    let _ = docker
        .create_image(
            Some(CreateImageOptions {
                from_image: IMAGE,
                ..Default::default()
            }),
            None,
            None,
        )
        .try_collect::<Vec<_>>()
        .await
        .expect("❌ Failed to pull image");

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

    let create_result = docker
        .create_container(
            Some(CreateContainerOptions {
                name: id.to_string(),
                platform: Some("linux/amd64".to_string()),
            }),
            container_config,
        )
        .await;

    let container = match create_result {
        Ok(container) => container,
        Err(e) => {
            eprintln!("❌ Failed to create container: {}", e);
            return None;
        }
    };

    println!("🚀 Starting container: {}", container.id);

    // 🧠 Fetch and update profile if user exists
    match profile::Entity::find()
        .filter(profile::Column::Email.eq(email.clone()))
        .one(&*state.db)
        .await
    {
        Ok(Some(user)) => {
            let mut model: profile::ActiveModel = user.into();
            model.docker_container_id = Set(Some(container.id.clone()));
            if let Err(e) = model.update(&*state.db).await {
                eprintln!("❌ Failed to update container_id in profile: {}", e);
            } else {
                println!("✅ Updated user's container_id");
            }
        }
        Ok(None) => {
            eprintln!("⚠️ No user found with email: {}", email);
        }
        Err(e) => {
            eprintln!("❌ DB error when finding user: {}", e);
        }
    }

    if let Err(e) = docker
        .start_container(&container.id, None::<StartContainerOptions<String>>)
        .await
    {
        eprintln!("❌ Failed to start container: {}", e);
        return None;
    }

    println!(
        "✅ Terminal container `{}` is up and running!",
        container.id
    );

    Some(container.id)
}
