import { Request, Response } from "express";
import { prisma } from "../../prismaDb/prismaDb";

const getUser = async (req: Request, res: Response) => {
  const { userId } = req.user as { userId: string };

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  const userProfile = await prisma.profile.findUnique({
    where: {
      userId,
    },
  });

  if (!userProfile) {
    res.status(404).json({ message: "User profile not found" });
    return;
  }

  res.status(200).json({
    message: `Hello, user with Google ID`,
    user: userProfile,
  });
};

export default getUser;
