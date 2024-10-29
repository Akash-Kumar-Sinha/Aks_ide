import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Editor from "@/components/Repo/Editor";
import Terminal from "@/components/Repo/Terminal";
import { socket } from "@/utils/Socket";
import axios from "axios";
import Back from "@/components/Back";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const CodeEditor = () => {
  const { repoId } = useParams();
  const location = useLocation();
  const [fileStructure, setFileStructure] = useState<
    Record<string, unknown | null>
  >({});
  const [userFolderName, setUserFolderName] = useState<string | unknown>(null);

  const getFiles = async () => {
    const name = location.state?.name;
    if (!name) {
      console.log("Repository name is missing.");
      return;
    }
    try {
      const fileResponse = await axios.post(
        `${SERVER_URL}/repo/files`,
        { name },
        { withCredentials: true }
      );

      setUserFolderName(fileResponse.data.folderId);
      setFileStructure(fileResponse.data.UserRepoStructure);
    } catch (err) {
      console.error("Error fetching file structure:", err);
    }
  }

  useEffect(() => {
    getFiles();
  }, [getFiles]);

  useEffect(() => {
    socket.on("file_refresh", getFiles);
    return () => {
      socket.off("file_refresh", getFiles);
    };
  }, [getFiles]);

  useEffect(() => {
    if (userFolderName) {
      socket.on("connect", () => {
        console.log(socket.id);
      });
    }
  }, [userFolderName]);

  useEffect(() => {
    const folderRepoName = location.state.name;
    if (userFolderName && folderRepoName) {
      socket.emit("folder_name", { userFolderName, folderRepoName });
    }
  }, [location.state.name, userFolderName]);

  return (
    <div className="h-screen w-full flex flex-col">
      <header className="pb-2 flex justify-between text-blue-400 px-4">
        <Back />
        <p className="hover:underline hover:cursor-pointer font-semibold">
          Id: {repoId}
        </p>
      </header>
      <div className="h-full flex flex-col">
        <div className="w-full flex-grow flex flex-row">
          <Editor fileStructure={fileStructure} />
        </div>

        <div className="w-full border-t border-gray-300">
          <Terminal name={location.state?.name} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
