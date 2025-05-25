# 🧠 Aks IDE – Terminal Module

The **Terminal Module** is a core component of **Aks IDE** – a cloud-based, real-time development environment that gives developers access to a fully-functional Linux shell directly in their browser. This module serves as the foundation for code execution, file interaction, and developer tooling within the IDE.

---

![Terminal Image](image.png)

- **Watch Aks IDE in Action – Rust Server Branch**  
[Click to watch the demo video](https://drive.google.com/file/d/1lsRfhyKzmDOu24aeY3xtF6QpcKJjdgNM/view?usp=sharing)


- **Legacy Version**  
This is the previous working version of the terminal module from the `main` branch.  
[Click to watch the legacy demo](https://drive.google.com/file/d/11ykA2aA7gbdgfaeedPh0G2Spd1P8DdyW/view?usp=sharing)

---

## 📌 Current Capabilities

### ✅ Real-Time Shell Access

- Each session launches an **isolated Docker container** (Ubuntu-based).
- Executes a real Linux shell (typically `bash`) inside the container.
- Users can run commands, install packages (e.g., `node`, `python`), and execute scripts just like on a local system.

---

## ⚙️ Architecture Overview

| Component     | Technology           |
| ------------- | -------------------- |
| Backend       | Rust (Axum framework) |
| Frontend      | React + xterm.js      |
| Communication | WebSockets (bi-directional) |
| Terminal Core | PTY (Pseudo-Terminal) |

---

## 💡 Core Features

| Feature                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| 🐧 **Real Linux Shell**   | Full-featured bash shell inside an Ubuntu-based Docker container.           |
| 🔄 **WebSocket I/O**      | Real-time terminal input/output via WebSocket.                              |
| 🖥️ **xterm.js UI**         | Responsive terminal interface rendered in-browser using xterm.js.           |
| 🧱 **Single Terminal**     | One terminal session per user (multi-terminal support coming soon).         |
| 🛠 **Dev Tool Installation** | Users can install languages/tools (Node.js, Python, etc.) inside the container. |

---

## 🔮 Roadmap & Future Features

### 🗂️ 1. Multi-Terminal Support

- Multiple terminal instances via tabs or split panes.
- Support for:
  - Shared container across terminals.
  - Dedicated services per terminal (e.g., build, logs, DB shell).

### 📁 2. File System Access & Management

- In-browser visual file explorer with full CRUD.
- Features:
  - Browse files/directories.
  - Upload/download files.
  - Sync changes with terminal and editor in real time.

### 🧑‍💻 3. Embedded Code Editor

- Integrate **Monaco Editor** or **CodeMirror** for in-browser coding.
- Edit files that are instantly runnable in the terminal.
- Compile and run code without leaving the IDE.

### 🤖 4. AI Assistant (via MCP Server)

- AI features include:
  - Shell command auto-completion.
  - Real-time debugging and error explanation.
  - Optimizations and AI-suggested fixes.
  - Debug mode: auto-search errors and provide resolutions.

### 🐳 5. Run Docker & Databases Inside IDE

- Launch Docker containers from terminal sessions.
- Run databases like **PostgreSQL**, **MySQL**, **MongoDB** inside IDE.
- Lightweight browser-based GUI for database management.
- Simulate microservices and multi-container applications directly from the IDE.

---

## ⚙️ Why Rust for the Backend?

- **System-level control**: Ideal for managing PTYs, IO streams, and long-running processes.
- **High performance**: Minimal memory usage and low latency.
- **Memory safety**: Eliminates entire classes of bugs common in JS/TS.
- **Binary data handling**: More robust than Node.js for binary streams and filesystem tasks.

> _The prototype built with Node.js faced challenges with binary data and stream stability. Rust resolves these with performance and safety guarantees._

---

## 🚧 Technical Challenges

### ❌ Ephemeral Docker Filesystem

- Docker containers are **stateless** by default – all session data is lost on shutdown.
- Limitations:
  - Files are not retained across sessions.
  - Makes project continuity and file storage unreliable.

### ✅ Planned Solutions

- Integration with:
  - External volumes for persistent storage.
  - Cloud storage (e.g., AWS S3) for file backups.
  - Database or object storage for session snapshots and state.

---

## 📦 Tech Stack Summary

| Layer         | Technology                                |
|--------------|--------------------------------------------|
| Frontend      | React, xterm.js                           |
| Backend       | Rust (Axum)                               |
| Terminal Core | PTY (bash shell)                          |
| Containers    | Docker (Ubuntu base image)                |
| Communication | WebSocket                                 |
| Editor        | Monaco Editor / CodeMirror (planned)      |
| AI Assistant  | MCP Server, local LLMs (planned)          |
| File Storage  | Cloud Storage, S3, External Volumes       |

---

## 🚀 Vision

The Terminal Module aims to evolve into a full-stack **cloud-native development OS**:

- Seamless **code → compile → debug → deploy** lifecycle.
- Fully integrated **AI pair programming** and real-time collaboration.
- Developer environments without local setup – code instantly from anywhere.
- Local-first desktop application that connects to cloud infrastructure.

> _Just install our desktop app, log in, and start building – no setup required._

---

## 📬 Contact

Have questions, suggestions, or want to collaborate?

- ✉️ Email: [akashkumarsinha403@gmail.com]


use futures_util::StreamExt;
use nix::libc;
use nix::pty::{openpty, Winsize};
use nix::sys::signal::{self, Signal};
use nix::sys::termios::{
    self, InputFlags, LocalFlags, OutputFlags, SetArg, SpecialCharacterIndices,
};
use nix::unistd::{close, dup2};
use socketioxide::extract::SocketRef;

use std::os::unix::io::{AsRawFd, FromRawFd, RawFd};
use std::process::{Command, Stdio};
use tokio::io::AsyncReadExt;
use tokio::task;

use crate::socket_handler::terminal_events::read_and_emit_terminal_output;
use crate::AppState;

pub async fn pseudo_terminal(
    s: &SocketRef,
    docker_container_id: Option<String>,
    state: AppState,
    email: String,
) -> Result<(), std::io::Error> {
    let winsize = Winsize {
        ws_row: 24,
        ws_col: 80,
        ws_xpixel: 0,
        ws_ypixel: 0,
    };

    let pty = openpty(Some(&winsize), None).map_err(|e| {
        println!("Failed to open PTY: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

    let slave_name = unsafe {
        let name_ptr = libc::ptsname(pty.master);
        if name_ptr.is_null() {
            println!("Could not get slave PTY name");
            String::from("unknown")
        } else {
            std::ffi::CStr::from_ptr(name_ptr)
                .to_string_lossy()
                .into_owned()
        }
    };

    println!(
        "Created PTY: master={} slave={} name={}",
        pty.master, pty.slave, slave_name
    );

    let mut termios = termios::tcgetattr(pty.slave).map_err(|e| {
        println!("Failed to get termios: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

    termios.input_flags.remove(
        InputFlags::ICRNL
            | InputFlags::IXON
            | InputFlags::ISTRIP
            | InputFlags::IGNCR
            | InputFlags::INLCR,
    );
    termios.output_flags.remove(OutputFlags::OPOST);
    termios
        .local_flags
        .remove(LocalFlags::ECHO | LocalFlags::ICANON | LocalFlags::ISIG | LocalFlags::IEXTEN);

    termios.control_chars[SpecialCharacterIndices::VMIN as usize] = 1;
    termios.control_chars[SpecialCharacterIndices::VTIME as usize] = 0;

    termios::tcsetattr(pty.slave, SetArg::TCSANOW, &termios).map_err(|e| {
        println!("Failed to set termios: {}", e);
        std::io::Error::new(std::io::ErrorKind::Other, e)
    })?;

    let container_id = docker_container_id.unwrap_or_else(|| "default-container".to_string());

    let docker_ps = Command::new("docker")
        .args(["ps", "-q", "--filter", &format!("id={}", container_id)])
        .output();

    match docker_ps {
        Ok(output) => {
            if output.stdout.is_empty() {
                println!(
                    "Warning: Container {} doesn't appear to be running",
                    container_id
                );
            } else {
                println!("Container {} is running", container_id);
            }
        }
        Err(e) => {
            println!("Error checking container status: {}", e);
        }
    }

    let master_fd = pty.master;
    let slave_fd = pty.slave;

    let master = unsafe { std::fs::File::from_raw_fd(libc::dup(master_fd)) };

    {
        let mut terminal_guard = state.terminal_mapping.lock().unwrap();
        terminal_guard.insert(
            email.clone(),
            Some(master.try_clone().expect("Failed to clone master file")),
        );
    }

    let shell_command = "/bin/bash";

    let mut docker_command = Command::new("docker");
    docker_command
        .arg("exec")
        .arg("-it")
        .arg(&container_id)
        .env("TERM", "xterm-256color")
        .env("COLORTERM", "truecolor")
        .env("LC_ALL", "C.UTF-8")
        .arg(shell_command)
        .stdin(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stdout(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) })
        .stderr(unsafe { Stdio::from_raw_fd(libc::dup(slave_fd)) });

    let mut child = match docker_command.spawn() {
        Ok(child) => {
            println!("Docker exec process started successfully");
            child
        }
        Err(e) => {
            println!("Failed to start docker exec: {}", e);
            s.emit(
                "terminal_error",
                &format!("Failed to start docker exec: {}", e),
            )
            .ok();
            return Err(e);
        }
    };

    s.emit("terminal_success", "Terminal created successfully")
        .ok();

    // Clone the socket for the spawned tasks
    let socket_clone = s.clone();
    let email_clone = email.clone();
    // let master_clone = master.try_clone().expect("Failed to clone master file");

    read_and_emit_terminal_output(email_clone.clone(), state.clone(), socket_clone.clone())
        .await
        .ok();                          

    // let read_task = task::spawn(async move {
    //     let mut buffer = [0u8; 4096];
    //     let mut reader = tokio::fs::File::from_std(master_clone);

    //     loop {
    //         match reader.read(&mut buffer).await {
    //             Ok(0) => {
    //                 println!("Terminal session ended for {}", email_clone);
    //                 socket_clone
    //                     .emit("terminal_closed", "Terminal session ended")
    //                     .ok();
    //                 return;
    //             }
    //             Ok(n) => {
    //                 if let Ok(text) = std::str::from_utf8(&buffer[0..n]) {
    //                     socket_clone.emit("terminal_data", text).ok();
    //                 } else {
    //                     let mut valid_end = n;
    //                     while valid_end > 0 {
    //                         if let Ok(text) = std::str::from_utf8(&buffer[0..valid_end]) {
    //                             socket_clone.emit("terminal_data", text).ok();
    //                             break;
    //                         }
    //                         valid_end -= 1;
    //                     }

    //                     if valid_end == 0 {
    //                         let hex_data = buffer[0..n]
    //                             .iter()
    //                             .map(|b| format!("\\x{:02x}", b))
    //                             .collect::<Vec<String>>()
    //                             .join("");
    //                         println!("Received binary data for {}: {}", email_clone, hex_data);
    //                     }
    //                 }
    //             }
    //             Err(e) => {
    //                 println!("Terminal read error for {}: {}", email_clone, e);
    //                 socket_clone
    //                     .emit("terminal_error", &format!("Terminal read error: {}", e))
    //                     .ok();
    //                return;
    //             }
    //         }
    //     }
    // });

    // Clone the socket for the second task
    let socket_clone2 = s.clone();
    let email_clone2 = email.clone();
    let state_clone = state.clone();

    task::spawn(async move {
        let exit_status = child.wait();

        match exit_status {
            Ok(status) => {
                println!(
                    "Docker process exited with status: {} for {}",
                    status, email_clone2
                );
            }
            Err(e) => {
                println!(
                    "Error waiting for docker process for {}: {}",
                    email_clone2, e
                );
            }
        }

        {
            let mut terminal_guard = state_clone.terminal_mapping.lock().unwrap();
            terminal_guard.remove(&email_clone2);
        }

        socket_clone2
            .emit("terminal_closed", "Docker process terminated")
            .ok();
    });

    Ok(())
}

use crate::{AppState, CloseTerminalPayload, TerminalInputPayload, TerminalResizePayload};
use nix::libc;
use nix::pty::Winsize;
use socketioxide::extract::SocketRef;
use std::io::Write;
use std::os::unix::io::AsRawFd;
use tokio::io::AsyncReadExt;
use tokio::time::{timeout, Duration};

pub async fn handle_terminal_input(
    s: &SocketRef,
    state: AppState,
    data: TerminalInputPayload,
) -> Result<(), std::io::Error> {
    let email = data.email.clone();
    let input_data = data.data;

    // Get terminal file with minimal lock time
    let mut terminal_file = {
        let terminal_mapping = state.terminal_mapping.lock().unwrap();
        match terminal_mapping.get(&email) {
            Some(Some(file)) => file.try_clone()?,
            _ => {
                let error_msg = format!("No terminal found for email: {}", email);
                s.emit("terminal_error", &error_msg).ok();
                return Err(std::io::Error::new(std::io::ErrorKind::NotFound, error_msg));
            }
        }
    };

    // Write input to terminal synchronously (faster and more reliable for this use case)
    match terminal_file.write_all(input_data.as_bytes()) {
        Ok(_) => {
            // Flush immediately to ensure data is sent
            if let Err(e) = terminal_file.flush() {
                println!("Error flushing terminal for {}: {}", email, e);
                s.emit("terminal_error", &format!("Error flushing terminal: {}", e))
                    .ok();
                return Err(e);
            }
        }
        Err(e) => {
            println!("Error writing to terminal for {}: {}", email, e);
            s.emit(
                "terminal_error",
                &format!("Error writing to terminal: {}", e),
            )
            .ok();
            return Err(e);
        }
    }

    // Give the terminal a moment to process the input
    tokio::time::sleep(Duration::from_millis(50)).await;

    match timeout(
        Duration::from_millis(300),
        read_and_emit_terminal_output(email.clone(), state.clone(), s.clone()),
    )
    .await
    {
        Ok(Ok(_)) => {} // Success
        Ok(Err(e)) => {
            println!("Failed to read terminal output for {}: {}", email, e);
            // Don't return error here, input was successful
        }
        Err(_) => {
            println!("Terminal read timeout for {}", email);
            // Don't return error here, input was successful
        }
    }

    Ok(())
}

pub async fn handle_terminal_resize(
    s: &SocketRef,
    state: AppState,
    data: TerminalResizePayload,
) -> Result<(), std::io::Error> {
    let email = data.email.clone();

    // Fast path for resize - minimize lock time
    let fd = {
        let terminal_mapping = state.terminal_mapping.lock().unwrap();
        match terminal_mapping.get(&email).and_then(|f| f.as_ref()) {
            Some(file) => file.as_raw_fd(),
            None => {
                let error_msg = format!("No terminal found for email: {}", email);
                s.emit("terminal_error", &error_msg).ok();
                return Err(std::io::Error::new(std::io::ErrorKind::NotFound, error_msg));
            }
        }
    };

    let winsize = Winsize {
        ws_row: data.rows,
        ws_col: data.cols,
        ws_xpixel: 0,
        ws_ypixel: 0,
    };

    // Use spawn_blocking for the ioctl syscall to avoid blocking async runtime
    let result = tokio::task::spawn_blocking(move || unsafe {
        libc::ioctl(fd, libc::TIOCSWINSZ, &winsize as *const Winsize)
    })
    .await;

    match result {
        Ok(0) => {
            println!(
                "Terminal resized to {}x{} for {}",
                data.cols, data.rows, email
            );
            Ok(())
        }
        Ok(errno) => {
            let error_msg = format!("Failed to resize terminal: errno {}", errno);
            println!("{}", error_msg);
            s.emit("terminal_error", &error_msg).ok();
            Err(std::io::Error::new(std::io::ErrorKind::Other, error_msg))
        }
        Err(e) => {
            let error_msg = format!("Failed to resize terminal: {}", e);
            s.emit("terminal_error", &error_msg).ok();
            Err(std::io::Error::new(std::io::ErrorKind::Other, error_msg))
        }
    }
}

pub async fn handle_close_terminal(
    s: &SocketRef,
    state: AppState,
    data: CloseTerminalPayload,
) -> Result<(), std::io::Error> {
    let email = data.email.clone();

    // Fast removal with minimal lock time
    {
        let mut terminal_mapping = state.terminal_mapping.lock().unwrap();
        terminal_mapping.remove(&email);
    }

    s.emit("terminal_closed", "Terminal session closed").ok();
    Ok(())
}

pub async fn read_terminal_output(
    email: String,
    state: AppState,
) -> Result<String, std::io::Error> {
    // Get the terminal file handle from AppState
    let master_file = {
        let terminal_guard = state.terminal_mapping.lock().unwrap();
        match terminal_guard.get(&email) {
            Some(Some(file)) => file.try_clone().map_err(|e| {
                println!("Failed to clone terminal file for {}: {}", email, e);
                std::io::Error::new(std::io::ErrorKind::Other, e)
            })?,
            Some(None) => {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    format!("No active terminal for user: {}", email),
                ));
            }
            None => {
                return Err(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    format!("User {} not found in terminal mapping", email),
                ));
            }
        }
    };

    // Read from the terminal
    let mut buffer = [0u8; 4096];
    let mut reader = tokio::fs::File::from_std(master_file);

    match reader.read(&mut buffer).await {
        Ok(0) => {
            println!("Terminal session ended for {}", email);
            // Clean up the terminal mapping
            {
                let mut terminal_guard = state.terminal_mapping.lock().unwrap();
                terminal_guard.remove(&email);
            }
            Err(std::io::Error::new(
                std::io::ErrorKind::UnexpectedEof,
                "Terminal session ended",
            ))
        }
        Ok(n) => {
            if let Ok(text) = std::str::from_utf8(&buffer[0..n]) {
                Ok(text.to_string())
            } else {
                // Handle partial UTF-8 sequences
                let mut valid_end = n;
                while valid_end > 0 {
                    if let Ok(text) = std::str::from_utf8(&buffer[0..valid_end]) {
                        return Ok(text.to_string());
                    }
                    valid_end -= 1;
                }

                // If no valid UTF-8 found, return hex representation
                let hex_data = buffer[0..n]
                    .iter()
                    .map(|b| format!("\\x{:02x}", b))
                    .collect::<Vec<String>>()
                    .join("");
                println!("Received binary data for {}: {}", email, hex_data);
                Ok(hex_data)
            }
        }
        Err(e) => {
            println!("Terminal read error for {}: {}", email, e);
            Err(e)
        }
    }
}

pub async fn read_and_emit_terminal_output(
    email: String,
    state: AppState,
    socket: SocketRef,
) -> Result<(), std::io::Error> {
    // Read terminal output
    match read_terminal_output(email.clone(), state.clone()).await {
        Ok(output) => {
            // Emit the output to the client
            println!("Emitting terminal output for {}: {}", email, output);
            socket.emit("terminal_data", &output).ok();
            println!("Terminal output emitted for {}: {}", email, output);
            Ok(())
        }
        Err(e) => {
            println!("Failed to read terminal output for {}: {}", email, e);
            // Emit error to client
            socket
                .emit("terminal_error", &format!("Read error: {}", e))
                .ok();
            Err(e)
        }
    }
}
