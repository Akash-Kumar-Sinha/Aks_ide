import { Request, Response } from "express";
import { prisma } from "../prismaDb/prismaDb";

const changeName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const { providerId } = req.user as { providerId: string };

    if (!providerId || !name) {
      res.status(401).json({
        message: "Unauthorized: No token provided or name is not provided",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        providerId,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await prisma.user.update({
      where: {
        providerId,
      },
      data: {
        name,
        profile: {
          update: {
            name,
          },
        },
      },
    });

    res.status(200).json({ message: "Name updated successfully" });
  } catch {
    res.status(500).json({ message: "Error updating name" });
    return;
  }
};

export default changeName;
