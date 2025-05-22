# 🧠 Aks IDE – Terminal Module

The **Terminal Module** is a core component of **Aks IDE** – a cloud-based, real-time development environment that provides developers access to a fully-functional Linux shell directly in their browser. This module acts as the foundation for all code execution, file interaction, and developer tooling.

This document outlines the current functionality, architecture, challenges, and future vision of the terminal module.

![Terminal_image](image.png)
<video controls src="aks_ide.mp4" title="Title"></video>
---

## 📌 Current Capabilities

### ✅ Real-Time Shell Access

- Each session launches an **isolated Docker container** (Ubuntu-based) for the user.
- A real Linux shell (usually `bash`) is executed inside the container.
- Users can run commands, install programming languages (e.g., `node`, `python`), and execute scripts as on a local system.

### ⚙️ Architecture Overview

- **Backend**: Built with **Rust (Axum framework)**.
- **Frontend**: Developed using **React** with **xterm.js** to render terminal output.
- **Communication**: Real-time via **WebSockets**, using a **PTY (pseudo-terminal)** on the server side.

### 💡 Core Features

| Feature                 | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| 🐧 Real Linux Shell     | Full-featured interactive shell (bash) inside Docker container.           |
| 🔄 WebSocket I/O        | Real-time bidirectional communication via WebSocket for terminal streams. |
| 🖥️ xterm.js UI          | Responsive terminal interface rendered in-browser.                        |
| 🧱 Single Terminal Only | Currently supports one terminal per user session.                         |
| 🛠 Install Dev Tools     | Users can install software (Node.js, npm, Python, etc.) inside container. |

---

## 🔮 Roadmap & Visionary Features

The terminal is evolving into a full-featured cloud IDE. Here’s what’s coming next:

### 🗂 1. Multi-Terminal Support

- Ability to open multiple terminal instances (via tabs or split screens).
- Each terminal may connect to:
  - The same container (for parallel tasking),
  - Or different services (e.g., one for build, one for logs).

### 📁 2. File System Access & Management

- Visual file explorer with full CRUD (Create, Read, Update, Delete) operations.
- Features:
  - Navigate through files and directories.
  - Upload/download files between user device and container.
  - Run or modify code directly from the terminal.
  - File change syncing with in-browser code editor.

### 🧑‍💻 3. Embedded Code Editor

- Rich text/code editing with **Monaco Editor** or **CodeMirror**.
- Save files that are instantly accessible from the terminal.
- Compile or run code directly within the IDE interface.

### 🤖 4. AI Assistant via MCP Server

- Integration with AI models to:
  - Auto-complete shell commands and code.
  - Debug terminal errors.(For Debug Mode, enable search engine to find the bug and resolve it itself.)
  - Explain terminal output or error logs.
  - Suggest optimizations or fixes.

### 🐳 5. Run Docker & Databases Inside IDE

- Users can:
  - Launch their own Docker containers from the terminal.
  - Run databases like PostgreSQL, MySQL, MongoDB with exposed ports.
  - Visualize DBs in browser via lightweight GUIs – without downloading any client.
  - Experiment with microservices and containers directly from the terminal interface.

---

## ⚙️ Why Rust for the Backend?

- **Low-level access** to system processes and file descriptors.
- **Better control** over PTY and IO streams than TypeScript or Node.js.
- **Memory safety** and **performance** ideal for handling multiple real-time terminal sessions.
- Rust eliminates common bugs and provides better stability for long-running processes.

> _Note: The original prototype was in TypeScript, but encountered issues when reading binary data from the filesystem. Rust solves this by offering efficient, byte-level file IO._

---

## 🚧 Technical Challenges

### ❌ Ephemeral Docker Filesystem

- Docker containers are **ephemeral** – all files are lost once the container stops.
- This makes local storage inside containers unreliable.
- Need for:
  - External persistent volumes.
  - Database or object storage to retain project files and session history.

---

## 📦 Tech Stack Summary

| Layer                  | Technology                          |
| ---------------------- | ----------------------------------- |
| Frontend               | React, xterm.js                     |
| Backend                | Rust, Axum                          |
| Terminal               | PTY, Bash                           |
| Containers             | Docker (Ubuntu-based)               |
| Communication          | WebSocket                           |
| Editor (Planned)       | Monaco, CodeMirror                  |
| AI (Planned)           | MCP Server, Local LLMs              |
| File Storage (Planned) | Cloud Storage, S3, External Volumes |

---

## 🚀 Vision

The Aks IDE Terminal Module aims to become much more than a shell interface. The ultimate goal is a **cloud-native development operating system**:

- AI-assisted and developer-friendly.
- Seamless code–compile–debug–deploy lifecycle.
- No need for local setup or external tools.
- Future-ready for cloud development, AI pair programming, and collaborative coding.
- A complete ecosystem for developers to build, test, and deploy applications in a single environment without doing manual setups or installations just have to install our IDE Desktop app and start coding.
