import express, { Express } from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoute from "./route/authRoute";
import repoRoute from "./route/repoRoute";
import { setupSocket } from "./socket/socketHandler";

dotenv.config();
const app: Express = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 9000;

const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;

if (!SESSION_SECRET_KEY) {
  throw new Error("Missing SESSION_SECRET_KEY. Check the .env file.");
}

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));

app.use(
  session({
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

setupSocket(io);

app.use("/auth", authRoute);

app.use("/repo", repoRoute);

httpServer.listen(SOCKET_PORT, () => {
  console.log(`Socket server is running at ws://localhost:${SOCKET_PORT}`);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
