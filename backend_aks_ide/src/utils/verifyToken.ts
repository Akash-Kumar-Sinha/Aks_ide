import { NextFunction, Request, Response } from "express";
import { prisma } from "../prismaDb/prismaDb";
import { verifyAccessToken, verifyRefreshToken } from "./createTokens";

const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const refreshToken = req.cookies.refreshToken;
  const acessToken = req.headers["authorization"]?.split(" ")[1];

  if (!refreshToken || !acessToken) {
    res
      .status(401)
      .json({ message: "Unauthorized: No token provided", authorized: false });
    return;
  }

  const decodedRefreshToken = await verifyRefreshToken(refreshToken);
  const decodedAccessToken = verifyAccessToken(acessToken);

  if (!decodedRefreshToken || !decodedAccessToken) {
    res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
      authorized: false,
    });
    return;
  }

  if (decodedRefreshToken.id !== decodedAccessToken.userId) {
    res
      .status(401)
      .json({ message: "Unauthorized: Invalid", authorized: false });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decodedRefreshToken.id },
    });

    if (!user) {
      res
        .status(404)
        .json({ message: "Unauthorized: User not found", authorized: false });
      return;
    }

    res.status(200).json({ message: "Token is valid", authorized: true });
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", authorized: false });
  }
};

export default verifyToken;
