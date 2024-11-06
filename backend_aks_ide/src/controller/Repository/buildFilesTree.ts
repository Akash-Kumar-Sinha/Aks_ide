import Docker from "dockerode";
import executeDockerCommand from "../DockerOrchestration/executeDockerCommand";
import path from "path";

const buildFilesTree = async (
  container: Docker.Container,
  currentDir: string
): Promise<Record<string, unknown | null>> => {
  const tree: Record<string, unknown | null> = {};

  const command = `find ${currentDir}`;
  const result = (await executeDockerCommand({ container, command })) as string;

  const items = result
    .replace(/[^\x20-\x7E\n\r]/g, "")
    .trim()
    .split("\n")
    .map((item) => item.trim().replace(/^p\//, ""));

  for (const item of items) {
    const itemName = path.basename(item);

    console.log("Processing item:", item, "as", itemName);

    const checkDirCommand = `[ -d "${item}" ] && echo "directory" || echo "file"`;
    const checkResult = (await executeDockerCommand({
      container,
      command: checkDirCommand,
    })) as string;

    const isDirectory = checkResult.trim() === "directory";

    console.log(`Is "${itemName}" a directory?`, isDirectory);

    if (isDirectory) {
      tree[itemName] = await buildFilesTree(container, item);
    } else {
      tree[itemName] = null;
    }
  }

  return tree;
};

export default buildFilesTree;
