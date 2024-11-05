import Docker from "dockerode";
import executeDockerCommand from "../DockerOrchestration/executeDockerCommand";

const parseTreeOutput = (output: string): Record<string, unknown | null> => {
  const lines = output
    .trim()
    .split('\n')
    .map(line => line.replace(/^[^\w]*home/, 'home').trim()); // Start each line directly from "home"

  const tree: Record<string, unknown | null> = {};

  lines.forEach(line => {
    const parts = line.split('/').filter(Boolean); // Split and filter out empty strings
    let currentLevel = tree;

    // Start processing each part in the line
    parts.forEach((part, index) => {
      if (!currentLevel[part]) {
        // Assign an empty object for directories and null for files
        currentLevel[part] = (index === parts.length - 1) ? null : {};
      }
      // Move to the next level
      currentLevel = currentLevel[part] as Record<string, unknown>;
    });
  });

  // Check if there is an unwanted key like '\x01A' and return only the `home` structure
  return tree["home"] ? tree["home"] as Record<string, unknown | null> : tree;
};

// Example usage in buildFilesTree
const buildFilesTree = async (
  container: Docker.Container,
  currentDir: string
): Promise<Record<string, unknown | null>> => {
  try {
    // Run the `find` command
    const command = `find ${currentDir} -print`;
    const result = (await executeDockerCommand({
      container,
      command,
    })) as string;

    console.log("result", result);
    // Parse the result into a structured tree object
    const tree = parseTreeOutput(result);
    return tree;
  } catch (error) {
    console.error("Error in buildFilesTree:", error);
    throw error;
  }
};

export default buildFilesTree;
