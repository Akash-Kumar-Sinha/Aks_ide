import { Request, Response } from "express";
import fetchUserId from "../../utils/fetchUserId";
import generateFile from "./generateFile";

const getFiles = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.user as { providerId: string };

    const { name: repoName } = req.body as { name: string };

    const { userId } = (await fetchUserId(providerId, undefined)) as {
      userId: string;
    };

    const currentWorkingDirectory = process.cwd();

    const fileStructure = await generateFile(
      currentWorkingDirectory,
      userId,
      repoName
    );

    res.send({ folderId: userId, UserRepoStructure: fileStructure });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default getFiles;
