import { Request, Response } from "express";
import { prisma } from "../../prismaDb/prismaDb";

const changeName = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    const { userId } = req.user as { userId: string };

    if (!userId || !name) {
      res.status(401).json({
        message: "Unauthorized: No token provided or name is not provided",
      });
      return;
    }

    await prisma.user.update({
      where: {
        id: userId,
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
