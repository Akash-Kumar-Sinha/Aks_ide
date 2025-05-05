import { io } from "socket.io-client";
import { WEBSOCKET_URL } from "./constant";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

if (!SOCKET_SERVER_URL) {
  throw new Error("SOCKET_SERVER_URL is not defined");
}
console.log("SOCKET_SERVER_URL", SOCKET_SERVER_URL);

export const socket = io(`${SOCKET_SERVER_URL}`);
export const ws = new WebSocket(WEBSOCKET_URL);



