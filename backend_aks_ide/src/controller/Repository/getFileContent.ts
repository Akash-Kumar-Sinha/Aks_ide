import { Request, Response } from "express";
import fetchUserId from "../../utils/fetchUserId";
import executeDockerCommand from "../DockerOrchestration/executeDockerCommand";
import { prisma } from "../../prismaDb/prismaDb";
import Docker from "dockerode";

const docker = new Docker();

const getFileContent = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.user as { providerId: string };

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
    const container = docker.getContainer(containerId);

    const filePath = req.query.filePath as string;

    console.log("Fetching file content...");

    const command = `cat ${filePath}`;

    const content = await executeDockerCommand({
      container,
      command: command,
    });

    console.log("Fetched content from Docker:", content);

    res.setHeader("Content-Type", "text/plain");
    res.status(200).send({ content: content });
  } catch (error) {
    console.error("Error fetching files content:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default getFileContent;
