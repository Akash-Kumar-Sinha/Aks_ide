import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../../prismaDb/prismaDb";

dotenv.config();

const JWTSECRET = process.env.JWT_SECRET;
const VITE_CLIENT_URL = process.env.VITE_CLIENT_URL;
if (!JWTSECRET) {
  throw new Error("Missing JWT_SECRET");
}

const googleLogin = async(req: Request, res: Response) => {
  const { accessToken, providerId } = req.user as {
    accessToken: string;
    providerId: string;
  };

  if (!req.user || !accessToken || !providerId) {
    return res.redirect("/");
  }

  const token = jwt.sign({ accessToken, providerId }, JWTSECRET, {
    expiresIn: "1d",
  });

  const user = await prisma.user.findUnique({
    where: {
      providerId
    }
  })

  if(!user) {
    res.status(404).json({ message: "User not found" });
    return
  }

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: true,
  });
  res.redirect(`${VITE_CLIENT_URL}/home`);
};

export default googleLogin;
