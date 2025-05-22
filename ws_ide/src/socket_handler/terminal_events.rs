use crate::{AppState, LoadTerminalPayload};
use std::io::Write;


pub async fn handle_terminal_write(
    state: AppState,
    data: LoadTerminalPayload,
) -> Result<(), std::io::Error> {
    let socket_id = state
        .email_mapping
        .lock()
        .unwrap()
        .get(&data.email)
        .cloned();
    
    
    if socket_id.is_none() {
        return Err(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "Socket ID not found in mapping",
        ));
    }
    
    let email = data.email.clone();
    
    if let Some(command) = data.command {
        
        let mut terminal_file_opt = None;
        
        {
            let terminal_mapping = state.terminal_mapping.lock().unwrap();
            if let Some(Some(file)) = terminal_mapping.get(&email) {
                terminal_file_opt = Some(file.try_clone()?);
            }
        }
        
        if let Some(mut terminal_file) = terminal_file_opt {
           
            let mut write_command = command.clone();
            if !write_command.ends_with('\n') {
                write_command.push('\n');
            }
            
            match terminal_file.write_all(write_command.as_bytes()) {
                Ok(_) => {
                    
                    if let Err(e) = terminal_file.flush() {
                        
                        if let Some(socket_id) = socket_id {
                            state
                                .socket_io
                                .to(socket_id)
                                .emit("terminal_error", &format!("Error flushing terminal: {}", e))
                                .await
                                .ok();
                        }
                    } else {
                        if let Some(socket_id) = socket_id {
                            let success_payload = serde_json::json!({
                                "status": "success",
                                "command": command,
                                "message": "Command successfully sent to terminal"
                            });
                            
                            state
                                .socket_io
                                .to(socket_id)
                                .emit("terminal_data", &success_payload)
                                .await
                                .ok();
                                
                            println!(" Emitted terminal_data event to client");
                        }
                    }
                }
                Err(e) => {
                    
                    if let Some(socket_id) = socket_id {
                        state
                            .socket_io
                            .to(socket_id)
                            .emit("terminal_error", &format!("Error writing to terminal: {}", e))
                            .await
                            .ok();
                    }
                    
                    return Err(e);
                }
            }
        } else {
            let error_msg = format!("No terminal found for email: {}", email);
            
            if let Some(socket_id) = socket_id {
                state
                    .socket_io
                    .to(socket_id)
                    .emit("terminal_error", &error_msg)
                    .await
                    .ok();
            }
            
            return Err(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                error_msg,
            ));
        }
    } else {
        
        if let Some(socket_id) = socket_id {
            state
                .socket_io
                .to(socket_id)
                .emit("terminal_error", "No command provided")
                .await
                .ok();
        }
        
        return Err(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "No command provided",
        ));
    }
    
    Ok(())
}