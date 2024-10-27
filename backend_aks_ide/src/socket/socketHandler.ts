import path from "path";
import { Server } from "socket.io";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pty = require("node-pty");

const ptyProcess = pty.spawn("bash", [], {
  name: "xterm-color",
  cols: 80,
  rows: 30,
  cwd: path.join(process.env.INIT_CWD || __dirname, "../Editor_stuff"),
  env: process.env,
});

if (!ptyProcess) {
  console.error("PTY process failed to spawn.");
} else {
  console.log("PTY process successfully spawned.");
}

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("A user connected");

    ptyProcess.onData((data: string) => {
      socket.emit("terminal_data", data);
    });

    socket.on("terminal_write", (data: string) => {
      console.log("Received data: ", data);
      ptyProcess.write(data);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
};
