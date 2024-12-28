import { Request, Response } from "express";
import generateFolder from "./generateFolder";
import { prisma } from "../../prismaDb/prismaDb";

const getFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.user as { userId: string };
    console.log("userId", userId);
    const { name: repoName } = req.body as { name: string };

    if (!userId) {
      res.status(401).json({ message: "Unauthorized: No token provided" });
      return;
    }

    if (!repoName) {
      res.status(400).send({ message: "Repository name is required" });
      return;
    }

    const profile = await prisma.profile.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!profile) {
      res.status(400).send({ message: "Profile not found" });
      return;
    }

    const containerId = profile?.dockerContainerId;

    if (!containerId) {
      res.status(400).send({ message: "Container ID is required" });
      return;
    }
    const currentWorkingDirectory = `/home/${profile.id}`;

    const fileStructure = await generateFolder(
      currentWorkingDirectory,
      profile.id,
      repoName
    );

    res.status(200).send({ fileStructure: fileStructure });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default getFiles;
