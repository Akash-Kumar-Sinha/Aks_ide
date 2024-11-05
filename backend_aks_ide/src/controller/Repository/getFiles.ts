import { Request, Response } from "express";
import fetchUserId from "../../utils/fetchUserId";
import generateFolder from "./generateFolder";
import { prisma } from "../../prismaDb/prismaDb";

const getFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.user as { providerId: string };
    const { name: repoName } = req.body as { name: string };

    if (!repoName) {
      res.status(400).send({ message: "Repository name is required" });
      return;
    }

    const { profileId } = (await fetchUserId(providerId, undefined)) as {
      userId: string;
      profileId: string;
    };

    const profile = await prisma.profile.findUnique({
      where: {
        id: profileId,
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
    const currentWorkingDirectory = `/home/${profileId}`;

    const fileStructure = await generateFolder(currentWorkingDirectory, profileId, repoName);

    console.log("File Structure:", JSON.stringify(fileStructure, null, 2));

    res.status(200).send({ fileStructure });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default getFiles;