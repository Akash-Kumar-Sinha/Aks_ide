import express, { Express } from "express";
import dotenv from "dotenv";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./route/authRoute";
import repoRoute from "./route/repoRoute";

dotenv.config();
const app: Express = express();
const port = process.env.PORT || 3000;

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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoute);

app.use("/repo", repoRoute);


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
