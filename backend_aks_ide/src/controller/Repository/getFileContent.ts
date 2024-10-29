import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import fetchUserId from "../../utils/fetchUserId";

const getFileContent = async (req: Request, res: Response) => {
  try {
    const { providerId } = req.user as { providerId: string };

    const { userId } = (await fetchUserId(providerId, undefined)) as {
      userId: string;
    };
    const filePath = req.query.filePath as string;

    const configureDirectory = path.resolve(
      process.cwd(),
      "../Editor_stuff",
      userId,
      filePath
    );

    const content = await fs.readFile(configureDirectory, "utf-8");
    console.log("File content:", content);
    res.status(200).send({ content });
  } catch (error) {
    console.error("Error fetching files content:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default getFileContent;
