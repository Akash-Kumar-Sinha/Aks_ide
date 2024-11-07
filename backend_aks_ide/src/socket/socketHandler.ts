import { Server } from "socket.io";
import { prisma } from "../prismaDb/prismaDb";
import Docker from "dockerode";
import startContainer from "../controller/DockerOrchestration/startContainer";
import executeDockerCommand from "../controller/DockerOrchestration/executeDockerCommand";
// import chokidar from "chokidar";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pty = require("node-pty");

const connectedSockets = new Set();
const docker = new Docker();

export const setupSocket = (io: Server) => {
  io.on("connection", async (socket) => {
    let terminalRendered = false;
    if (connectedSockets.has(socket.id)) {
      console.log(`Socket ${socket.id} is already connected.`);
      return;
    }

    connectedSockets.add(socket.id);
    console.log("A user connected");

    let containerId: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ptyProcess: any;

    socket.on("profile_id", async (profileId: string) => {
      console.log("Received profile ID:", profileId);
      const profile = await prisma.profile.findUnique({
        where: {
          id: profileId,
        },
      });
      if (!profile) return;

      if (profile.dockerContainerId) {
        containerId = profile.dockerContainerId;
        const container = docker.getContainer(containerId);

        try {
          const containerInfo = await container.inspect();
          if (!containerInfo.State.Running) {
            await container.start();
          } else {
            console.log(`Container ${containerId} is already running.`);
          }
        } catch (error: unknown) {
          const err = error as { statusCode?: number };
          if (err.statusCode === 404) {
            containerId = await startContainer(profileId);
          }
        }
      } else {
        containerId = await startContainer(profileId);
        console.log(`Created new container with ID: ${containerId}`);
      }
      if (!terminalRendered) {
        const createDir = `mkdir -p /home/${profileId}`;
        const containerDirectory = `/home/${profileId}`;
        ptyProcess = pty.spawn(
          "docker",
          [
            "exec",
            "-it",
            containerId,
            "bash",
            "-c",
            `${createDir} && cd ${containerDirectory} && exec bash`,
          ],
          {
            name: "xterm-color",
            rows: 15,
            cols: 100,
            env: process.env,
          }
        );
      }

      if (!ptyProcess) {
        console.error("PTY process failed to spawn.");
        terminalRendered = false;
        return;
      }

      const container = docker.getContainer(containerId);

      const result = await container.exec({
        Cmd: ["bash", "-c", "file --version"],
        AttachStdout: true,
        AttachStderr: true,
      });

      const resultStream = await result.start({ hijack: true, stdin: true });

      resultStream.on("data", async (data) => {
        const fileVersion = data.toString().split("-").pop();
        console.log(fileVersion);
        if (fileVersion && parseInt(fileVersion, 10) >= 5) {
          console.log("File utility is already installed.");
          return;
        } else {
          const exec = await container.exec({
            Cmd: ["bash", "-c", "apt-get update && apt-get install -y file"],
            AttachStdout: true,
            AttachStderr: true,
          });

          const stream = await exec.start({ hijack: true, stdin: true });

          stream.on("data", (data) => {
            socket.emit("terminal_data", data.toString());
            console.log(data.toString());
          });

          stream.on("end", () => {
            ptyProcess.write("\rclear\r");
            socket.emit(
              "terminal_data",
              "File utility installed successfully."
            );
          });
        }
      });

      resultStream.on("end", () => {
        console.log("File utility installed successfully.");
      });

      terminalRendered = true;
      console.log("PTY process successfully spawned.");

      let currentDir = "";

      ptyProcess.onData((data: string) => {
        socket.emit("terminal_data", data);
        if (data.includes("root@")) {
          currentDir = data.trim();
          currentDir = currentDir.replace("root@", "");
          currentDir = currentDir.replace("#", "");
          socket.emit("receive_pwd", currentDir);
          console.log("Current Directory Updated:", currentDir);
        }
      });

      socket.on("terminal_write", (data: string) => {
        if (ptyProcess) {
          ptyProcess.write(data);
        } else {
          console.warn("PTY process is not initialized.");
        }
      });

      socket.on("clear_terminal", async () => {
        if (ptyProcess) {
          ptyProcess.write("\rclear\r");
        }
      });

      socket.on("get_pwd", async () => {
        if (ptyProcess) {
          ptyProcess.write("pwd\r");
        }
      });

      socket.on(
        "write_code",
        async (data: { code: string; filePath: string }) => {
          if (!containerId) {
            socket.emit("error", "Unable to save file.");
            return;
          }

          const { code, filePath } = data;

          console.log(`Writing code to ${filePath}`, code);

          // Escape the code string to handle special characters and newlines
          const command = `printf "%s" "${code}" > ${filePath}`;

          try {
            const result = await executeDockerCommand({ container, command });
            console.log(result);
          } catch (error) {
            console.error("Error writing code to file:", error);
            socket.emit("error", "Failed to write code to file.");
          }
        }
      );

      socket.on("disconnect", async () => {
        console.log("A user disconnected");
        if (containerId) {
          const container = docker.getContainer(containerId);
          await container.stop();
          console.log(`Container ${containerId} stopped.`);
        }
        if (ptyProcess) {
          ptyProcess.kill();
        }
      });
    });
  });
};
