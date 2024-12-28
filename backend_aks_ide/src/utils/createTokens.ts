import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../utils/constant";
import { prisma } from "../prismaDb/prismaDb";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

const createToken = async (email: string) => {
  const JWT_SECRET_KEY = process.env.JWT_SECRET;

  if (!JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables");
  }

  try {
    const token = jwt.sign({ data: email }, JWT_SECRET_KEY, {
      expiresIn: "10m",
    });

    return token;
  } catch (error) {
    console.error("Error creating token:", error);
    return null;
  }
};

const verifyRefreshToken = async (token: string) => {
  try {
    const user = await prisma.user.findFirst({
      where: { refreshToken: token },
    });
    return user;
  } catch {
    console.log("Invalid token");
    return null;
  }
};

const verifyAccessToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as {
      email: string;
      userId: string;
    };
    return decoded;
  } catch {
    console.log("Invalid token");
    return null;
  }
};

export {
  createToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
};
