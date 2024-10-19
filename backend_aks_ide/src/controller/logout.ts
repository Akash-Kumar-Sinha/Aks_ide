import { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
  });

  res.status(200).json({ message: "Successfully logged out" });
};

export default logout;
