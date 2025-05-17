import { io, Socket } from "socket.io-client";

// Configure socket.io client
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:9000";

// Create and export the socket instance
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // Don't connect automatically, we'll do this on component mount
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ["websocket", "polling"],
  withCredentials: true,
});

// Debug socket events
socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});

export default socket;