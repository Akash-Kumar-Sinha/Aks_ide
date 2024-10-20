import { Request, Response } from "express";

import { prisma } from "../../prismaDb/prismaDb";
import fetchUserId from "../../utils/fetchUserId";

const createRepo = async (req: Request, res: Response) => {
  const { providerId } = req.user as {
    providerId: string;
  };

  try {
    const { profileId } = (await fetchUserId(providerId, undefined)) as {
      profileId: string;
    };

    const { templateName, techStack, description } = req.body;

    if (!templateName || !techStack || !profileId) {
      res.status(400).json({ message: "Please fill all the fields" });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      res.status(400).json({ message: "Profile not found" });
      return;
    }

    const exisitingRepo = await prisma.repository.findUnique({
      where: { name: templateName },
    });

    if (exisitingRepo) {
      res.status(400).json({ message: "Repository already exists" });
      return;
    }
    const repo = await prisma.repository.create({
      data: {
        name: templateName,
        techStack,
        description,
        profile: {
          connect: { id: profileId },
        },
      },
    });

    if (repo) {
      await prisma.profile.update({
        where: { id: profileId },
        data: {
          repoCount: {
            increment: 1,
          },
        },
      });
      res
        .status(200)
        .json({ message: "Repository created successfully", Repository: repo });
      return;
    }
    res.status(400).json({ message: "Failed to create repository" });
    return;
  } catch {
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export default createRepo;
