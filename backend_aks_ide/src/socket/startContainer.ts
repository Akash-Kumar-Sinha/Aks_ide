import { prisma } from "../prismaDb/prismaDb";
import createDockerContainer from "../controller/DockerOrchestration/createDockerContainer";

const startContainer = async (profileId: string) => {
  const containerId = await createDockerContainer();
  await prisma.profile.update({
    where: {
      id: profileId,
    },
    data: {
      dockerContainerId: containerId,
    },
  });
  console.log(`Created new container with ID: ${containerId}`);
  return containerId;
};

export default startContainer;
