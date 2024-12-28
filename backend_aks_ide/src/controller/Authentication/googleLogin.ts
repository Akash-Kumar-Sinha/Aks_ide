import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const JWTSECRET = process.env.JWT_SECRET;
const VITE_CLIENT_URL = process.env.VITE_CLIENT_URL;
if (!JWTSECRET) {
  throw new Error("Missing JWT_SECRET");
}

const googleLogin = async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = req.user as {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      avatar: string;
      provider: string;
      providerId: string;
      emailVerified: boolean;
    };
  };

  if (!req.user || !accessToken) {
    return res.redirect(`${VITE_CLIENT_URL}`);
  }

  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  res.cookie(`${process.env.REFRESH_TOKEN_NAME}`, refreshToken, {
    httpOnly: true,
    secure: true,
  });

  res.redirect(`${VITE_CLIENT_URL}`);
};

export default googleLogin;
