import { Request, Response } from "express";
import { prisma } from "../prismaDb/prismaDb";
import { generateAccessToken } from "./createTokens";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const REFRESH_TOKEN_NAME = process.env.REFRESH_TOKEN_NAME;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

if (!REFRESH_TOKEN_NAME) {
  throw new Error("Missing REFRESH_TOKEN_NAME environment variable");
}

const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    console.log("refreshAccessToken req.cookies:");
    const refreshToken = req.cookies[REFRESH_TOKEN_NAME];

    if (!refreshToken) {
      res
        .status(401)
        .json({ success: false, message: "Refresh token is missing" });
      return;
    }

    const user = await prisma.user.findFirst({
      where: { refreshToken: refreshToken },
    });

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.refreshToken) {
      res.status(401).json({
        success: false,
        message: "User does not have a refresh token",
      });
      return;
    }

    const accessToken = generateAccessToken({
      email: user.email,
      userId: user.id,
    });

    res.status(200).json({
      success: true,
      accessToken,
    });
    return;
  } catch (error: unknown) {
    console.error("Error in refreshAccessToken:", error);

    if (error instanceof Error && error.name === "TokenExpiredError") {
      res
        .status(401)
        .json({ success: false, message: "Refresh token has expired" });
      return;
    }

    if (error instanceof Error && error.name === "JsonWebTokenError") {
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
      return;
    }

    res.status(500).json({ success: false, message: "Internal Server Error" });
    return;
  }
};

export default refreshAccessToken;
