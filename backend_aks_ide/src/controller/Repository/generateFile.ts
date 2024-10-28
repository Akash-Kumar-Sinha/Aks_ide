import fs from "fs/promises";
import path from "path";

const generateFile = async (
  directory: string,
  userId: string,
  repoName: string
) => {
  const editorPath = path.join(directory, "../Editor_stuff");

  await fs.mkdir(editorPath, { recursive: true });

  const userFolderPath = path.join(editorPath, userId);
  await fs.mkdir(userFolderPath, { recursive: true });

  const newUserFolderPath = path.join(userFolderPath, repoName);
  await fs.mkdir(newUserFolderPath, { recursive: true });

  const buildFilesTree = async (
    currentDir: string
  ): Promise<Record<string, unknown | null>> => {
    const tree: Record<string, unknown | null> = {};

    const files = await fs.readdir(currentDir, { withFileTypes: true });

    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(currentDir, file.name);

        if (file.isDirectory()) {
          tree[file.name] = await buildFilesTree(filePath);
        } else {
          tree[file.name] = null;
        }
      })
    );

    return tree;
  };

  const fileTree = await buildFilesTree(newUserFolderPath);
  return { [repoName]: fileTree };
};

export default generateFile;
