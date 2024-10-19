import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../prismaDb/prismaDb";

const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { accessToken: token } = req.cookies;

  if (!token) {
    res
      .status(401)
      .json({ message: "Unauthorized: No token provided", authorized: false });
    return;
  }

  const JWTSECRET = process.env.JWT_SECRET;
  if (!JWTSECRET) {
    res.status(500).json({ message: "Internal server error" });
    return;
  }

  try {
    const { accessToken, providerId } = jwt.verify(token, JWTSECRET) as {
      accessToken: string;
      providerId: string;
    };

    const user = await prisma.user.findUnique({
      where: { providerId },
    });

    if (!user) {
      res
        .status(404)
        .json({ message: "Unauthorized: User not found", authorized: false });
      return;
    }

    if (accessToken !== user.accessToken) {
      res
        .status(401)
        .json({ message: "Unauthorized: Invalid token", authorized: false });
      return;
    }

    res.status(200).json({ message: "Token is valid", authorized: true });
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res
      .status(401)
      .json({ message: "Unauthorized: Invalid token", authorized: false });
    return;
  }
};

export default verifyToken;
