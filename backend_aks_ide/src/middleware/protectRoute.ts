import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}

const protectRoute = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const { accessToken: token } = req.cookies;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return
  }

  const JWTSECRET = process.env.JWT_SECRET;
  if (!JWTSECRET) {
    throw new Error("Missing JWT_SECRET");
  }

  try {
    req.user = jwt.verify(token, JWTSECRET);
    next();
  } catch {
    res.status(403).json({ message: "Forbidden: Invalid token" });
    return 
  }
};

export default protectRoute;
