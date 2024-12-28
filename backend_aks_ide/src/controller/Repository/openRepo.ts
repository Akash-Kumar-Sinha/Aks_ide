import { Request, Response } from "express";
import Docker from "dockerode";
import { prisma } from "../../prismaDb/prismaDb";
import executeDockerCommand from "../DockerOrchestration/executeDockerCommand";
import buildFilesTree from "./buildFilesTree";

const docker = new Docker();

const openRepo = async (req: Request, res: Response) => {
  const { userId } = req.user as { userId: string };

  const pwd = req.query.pwd as string;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
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

  const containerId = profile.dockerContainerId as string;
  const container = docker.getContainer(containerId);
  await executeDockerCommand({
    container,
    command: "pwd",
  });

  const fileTree = await buildFilesTree(container, pwd);

  console.log("fileTree", fileTree);

  res.status(200).send({ fileStructure: fileTree });
};

export default openRepo;
