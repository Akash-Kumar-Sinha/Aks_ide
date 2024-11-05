import { Request, Response } from "express";
import Docker from "dockerode";
import fetchUserId from "../../utils/fetchUserId";
import { prisma } from "../../prismaDb/prismaDb";
import executeDockerCommand from "../DockerOrchestration/executeDockerCommand";
import buildFilesTree from "./buildFilesTree";

const docker = new Docker();

const openRepo = async (req: Request, res: Response) => {
  console.log("openRepo");
  const { providerId } = req.user as { providerId: string };

  const pwd = req.query.pwd as string;

  console.log("pwd", pwd);

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

  const containerId = profile.dockerContainerId as string;

  const container = docker.getContainer(containerId);
  const result = await executeDockerCommand({
    container,
    command: "pwd",
  });

  console.log("openRepo result", result);

  const fileTree = await buildFilesTree(container, pwd);

  console.log("\nopenRepo",fileTree);

  res.send(fileTree);
};

export default openRepo;
