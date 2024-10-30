import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import Editor from "@/components/Repo/Editor";
import Terminal from "@/components/Repo/Terminal";
import { socket } from "@/utils/Socket";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const CodeEditor = () => {
  const location = useLocation();
  const [fileStructure, setFileStructure] = useState<
    Record<string, Record<string, unknown> | null>
  >({});
  const [userFolderName, setUserFolderName] = useState<string | null>(null);
  const [directoryLoading, setDirectoryLoading] = useState<boolean>(false);

  const getFiles = async () => {
    console.log("Fetching files...");
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

      if (fileResponse.data.UserRepoStructure) {
        setUserFolderName(fileResponse.data.folderId);
        setFileStructure(fileResponse.data.UserRepoStructure);
      }
    } catch (err) {
      console.error("Error fetching file structure:", err);
    }
  };

  useEffect(() => {
    getFiles();
  }, [getFiles]);

  useEffect(() => {
    const refreshFiles = () => {
      getFiles();
    };
    socket.on("file_refresh", refreshFiles);
    return () => {
      socket.off("file_refresh", refreshFiles);
    };
  }, [getFiles]);

  useEffect(() => {
    if (userFolderName) {
      const handleConnect = () => {
        console.log("Connected with socket ID:", socket.id);
      };

      socket.on("connect", handleConnect);
      return () => {
        socket.off("connect", handleConnect);
      };
    }
  }, [userFolderName]);

  useEffect(() => {
    const folderRepoName = location.state.name;
    if (userFolderName && folderRepoName) {
      socket.emit("folder_name", { userFolderName, folderRepoName });
    }
  }, [location.state.name, userFolderName]);

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-900">
      <div className="flex-grow flex flex-col h-2/3 ">
        <Editor
          fileStructure={fileStructure}
          directoryLoading={directoryLoading}
        />
      </div>

      <div className="h-1/3 border-t border-gray-600 bg-zinc-800 shadow-md rounded-lg overflow-y-auto">
        <Terminal />
      </div>
    </div>
  );
};

export default CodeEditor;
