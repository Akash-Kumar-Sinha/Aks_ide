import path from "path";
import { Server } from "socket.io";
import chokidar from 'chokidar';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pty = require("node-pty");

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let ptyProcess: any;
    let resolvedPath = "";

    socket.on("folder_name", (data) => {
      const { userFolderName, folderRepoName } = data;

      if (userFolderName && folderRepoName) {
        resolvedPath = path.resolve(
          process.cwd(),
          "../Editor_stuff",
          userFolderName,
          folderRepoName
        );

        ptyProcess = pty.spawn("bash", [], {
          name: "xterm-color",
          rows: 15,
          cols: 100,
          cwd: resolvedPath,
          env: process.env,
        });

        if (!ptyProcess) {
          console.error("PTY process failed to spawn.");
          return;
        } else {
          console.log("PTY process successfully spawned.");
        }

        ptyProcess.onData((data: string) => {
          socket.emit("terminal_data", data);
        });
      } else {
        console.log("Incomplete folder data received");
      }
    });

    chokidar.watch(resolvedPath).on('all', (event, path) => {
      io.emit('file_refresh', { path });
    });

    socket.on("terminal_write", (data: string) => {
      if (ptyProcess) {
        ptyProcess.write(data);
      } else {
        console.warn("PTY process is not initialized.");
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
      if (ptyProcess) {
        ptyProcess.kill();
      }
    });
  });
};
