import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { IoReturnUpBackOutline } from "react-icons/io5";
import Editor from "@/components/Repo/Editor";
import Terminal from "@/components/Repo/Terminal";
import { socket } from "@/utils/Socket";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const CodeEditor = () => {
  const { repoId } = useParams();
  const location = useLocation();
  const [fileStructure, setFileStructure] = useState<
    Record<string, unknown | null>
  >({});
  const [userFolderName, setUserFolderName] = useState<string | unknown>(null);

  useEffect(() => {
    const name = location.state?.name;
    if (!name) {
      console.log("Repository name is missing.");
      return;
    }

    (async () => {
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
    })();
  }, [location.state]);

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
    <div className="min-h-screen flex flex-col">
      <header className="pb-2 flex justify-between text-blue-400 px-4">
        <Link to="/home">
          <IoReturnUpBackOutline size={27} />
        </Link>
        <p className="hover:underline hover:cursor-pointer font-semibold">
          Id: {repoId}
        </p>
      </header>

      <div className="h-full flex-grow flex flex-col">
        <div className="flex flex-grow overflow-hidden">
          <Editor fileStructure={fileStructure} />
        </div>

        <div className="border-t border-gray-300 overflow-hidden">
          <Terminal name={location.state?.name} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
