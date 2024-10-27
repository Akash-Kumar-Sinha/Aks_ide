import { io } from "socket.io-client";

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL;

if(!SOCKET_SERVER_URL) {
    throw new Error("SOCKET_SERVER_URL is not defined");
}

export const socket = io(`${SOCKET_SERVER_URL}`);