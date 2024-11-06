import Docker from "dockerode";
import path from "path";
import { prisma } from "../../prismaDb/prismaDb";
import executeDockerCommand from "../DockerOrchestration/executeDockerCommand";
import buildFilesTree from "./buildFilesTree";

const docker = new Docker();
const generateFolder = async (
  directory: string,
  profileId: string,
  repoName: string
) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }
    const containerId = profile.dockerContainerId as string;
    const container = docker.getContainer(containerId);

    const formattedRepoName = repoName.replace(/ /g, "_");
    
    const userFolderPath = path.join("/home", profileId);
    const newUserFolderPath = path.join(userFolderPath, formattedRepoName);
    
    const command = `mkdir -p ${newUserFolderPath}`;
    await executeDockerCommand({ container, command });
    
    const fileTree = await buildFilesTree(container, newUserFolderPath);
    return fileTree;
  } catch (error) {
    console.error("Error in generateFolder:", error);
    throw error;
  }
};

export default generateFolder;
