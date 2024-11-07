import Docker from "dockerode";
import executeDockerCommand from "../DockerOrchestration/executeDockerCommand";
import path from "path";

const buildFilesTree = async (
  container: Docker.Container,
  currentDir: string
): Promise<Record<string, unknown | null>> => {
  const tree: Record<string, unknown | null> = {};

  const command = `ls -lA ${currentDir}`;
  const result = (await executeDockerCommand({ container, command })) as string;

  const items = result
    .replace(/[^\x20-\x7E\n\r]/g, "")
    .trim()
    .split("\n")
    .map((line) => line.trim());

  for (const line of items) {
    const parts = line.split(/\s+/);
    const fileType = parts[0];
    const itemName = parts[parts.length - 1];

    if (itemName) {
      if (fileType.startsWith("d")) {
        const itemPath = path.join(currentDir, itemName);
        tree[itemName] = await buildFilesTree(container, itemPath);
      } else if (fileType.startsWith("-")) {
        tree[itemName] = null;
      }
    }
  }

  return tree;
};

export default buildFilesTree;
