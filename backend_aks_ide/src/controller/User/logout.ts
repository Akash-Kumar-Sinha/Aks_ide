import { Request, Response } from "express";
import dotenv from "dotenv";
import { JwtPayload } from "jsonwebtoken";
import { verifyRefreshToken } from "../../utils/createTokens";
import { prisma } from "../../prismaDb/prismaDb";

dotenv.config();
const REFRESH_TOKEN_NAME = process.env.REFRESH_TOKEN_NAME;

if (!REFRESH_TOKEN_NAME) {
  throw new Error("Missing REFRESH_TOKEN_NAME environment variable");
}

const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies[REFRESH_TOKEN_NAME];

  if (!refreshToken) {
    res.status(400).json({ message: "Refresh token is missing" });
    return;
  }

  try {
    const decodedRefreshToken = (await verifyRefreshToken(
      refreshToken
    )) as JwtPayload;

    const deleteRefreshToken = await prisma.user.update({
      where: {
        id: decodedRefreshToken.id,
      },
      data: {
        refreshToken: null,
      },
    });

    if (!deleteRefreshToken) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    res.clearCookie(REFRESH_TOKEN_NAME, {
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({ message: "Successfully logged out" });
    return;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error verifying token:", err.message);

      if (err.name === "TokenExpiredError") {
        res.status(401).json({ message: "Refresh token has expired" });
        return;
      }
      if (err.name === "JsonWebTokenError") {
        res.status(401).json({ message: "Invalid refresh token" });
        return;
      }
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export default logout;
