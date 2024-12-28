import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyAccessToken } from "../utils/createTokens";

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

const protectRoute = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const verifiedUser = verifyAccessToken(token);
    if (!verifiedUser) {
      res.status(403).json({ message: "Forbidden: Invalid token" });
      return;
    }
    req.user = verifiedUser;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(403).json({ message: "Forbidden: Invalid token" });
    return;
  }
};

export default protectRoute;
