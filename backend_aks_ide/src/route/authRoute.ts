import { Router } from "express";
import passport from "passport";
import dotenv from "dotenv";

import "../middleware/googleAuth";
import getUser from "../controller/getUser";
import protectRoute from "../middleware/protectRoute";
import googleLogin from "../controller/googleLogin";
import logout from "../controller/logout";
import verifyToken from "../utils/verifyToken";
import sendToken from "../controller/sendToken";
import verifyEmail from "../controller/verifyEmail";
import createUser from "../controller/createUser";
import checkEmail from "../controller/checkEmail";

dotenv.config();

const authRoute = Router();

authRoute.get("/user_profile", protectRoute, getUser);

authRoute.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoute.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  googleLogin
);

authRoute.get("/verify_token", verifyToken);

authRoute.post('/send_token', sendToken);

authRoute.get("/verify/:email/:token", verifyEmail);

authRoute.post("/check_email", checkEmail)

authRoute.post("/create_user", createUser);

authRoute.post("/logout", protectRoute, logout);


export default authRoute;
