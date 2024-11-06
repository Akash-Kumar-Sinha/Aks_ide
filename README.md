# Welcome to Aks_ide

## Run on localMachine

```shell
  docker volume create postgres_data
```

```shell
  docker-compose up
```

import Docker from "dockerode";
import executeDockerCommand from "../DockerOrchestration/executeDockerCommand";
import path from "path";

const buildFilesTree = async (
  container: Docker.Container,
  currentDir: string
): Promise<Record<string, unknown | null>> => {
  console.log("\nbuildFilesTree", currentDir);
  const tree: Record<string, unknown | null> = {};

  // Run `find` to get a clean list of files and directories
  const command = `find ${currentDir} -mindepth 1 -maxdepth 1`;
  const result = (await executeDockerCommand({ container, command })) as string;

  // Sanitize and split items by newline, removing control characters if any
  const items = result
    .replace(/[^\x20-\x7E\n\r]/g, "") // Remove non-printable characters
    .trim()
    .split("\n");

  console.log("Items:", items);

  for (const item of items) {
    // Get the item name (last part of the path)
    const itemName = path.basename(item);

    // Check if the item is a directory or file
    const checkDirCommand = `[ -d "${item}" ] && echo "directory" || echo "file"`;
    const isDirectory =
      (
        (await executeDockerCommand({
          container,
          command: checkDirCommand,
        })) as string
      ).trim() === "directory";

    if (isDirectory) {
      console.log("Directory:", itemName);
      // Recursively build the tree for directories
      tree[itemName] = await buildFilesTree(container, item);
    } else {
      console.log("File:", itemName);
      // Files are represented with `null`
      tree[itemName] = null;
    }
  }

  return tree;
};

export default buildFilesTree;

<a
          href="https://dribbble.com/shots/21026626-Synerque-Task-manager-navigation-sidebar-UX-UI-design"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white text-3xl font-bold transition-transform duration-300 ease-in-out transform hover:scale-110"
        >
          R
        </a>
