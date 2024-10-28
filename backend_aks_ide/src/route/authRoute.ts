import { Router } from "express";
import passport from "passport";
import dotenv from "dotenv";

import "../middleware/googleAuth";
import protectRoute from "../middleware/protectRoute";
import logout from "../controller/User/logout";
import verifyToken from "../utils/verifyToken";
import verifyEmail from "../controller/Authentication/verifyEmail";
import getUser from "../controller/User/getUser";
import changeName from "../controller/User/changeName";
import googleLogin from "../controller/Authentication/googleLogin";
import sendToken from "../controller/Authentication/sendToken";
import checkEmail from "../controller/Authentication/checkEmail";
import createUser from "../controller/Authentication/createUser";

dotenv.config();

const authRoute = Router();

authRoute.get("/user_profile", protectRoute, getUser);

authRoute.put("/update_name", protectRoute, changeName);

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

authRoute.post("/send_token", sendToken);

authRoute.get("/verify/:email/:token", verifyEmail);

authRoute.post("/check_email", checkEmail);

authRoute.post("/create_user", createUser);

authRoute.post("/logout", protectRoute, logout);

export default authRoute;
