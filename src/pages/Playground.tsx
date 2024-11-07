import { useEffect, useRef, useState } from "react";
import axios from "axios";

import Editor from "@/components/Repo/Editor";
import Terminal from "@/components/Repo/Terminal";
import { socket } from "@/utils/Socket";
import useUserProfile from "@/utils/useUserProfile";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Playground = () => {
  const { userProfile } = useUserProfile();
  const [fileStructure, setFileStructure] = useState<
    Record<string, unknown | null>
  >({});
  const [explorerloadingStatus, setExplorerLoadingStatus] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileAbsolutePath, setSelectedFileAbsolutePath] = useState("");
  const [pwd, setPwd] = useState<string>("");
  const projectName = useRef<HTMLInputElement>(null);

  const createTemplate = async () => {
    if (!userProfile) return;
    try {
      if (!projectName.current) return;

      const name = projectName.current.value;
      if (!name) {
        console.error("Template name is required.");
        return;
      }

      const response = await axios.post(
        `${SERVER_URL}/repo/create_repo`,
        { projectName: name },
        { withCredentials: true }
      );

      if (response.status === 200) {
        await getFiles(name);
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const getFiles = async (name: string) => {
    if (!name) {
      console.log("Repository name is missing.");
      return;
    }

    try {
      const response = await axios.post(
        `${SERVER_URL}/repo/files`,
        { name },
        { withCredentials: true }
      );

      if (response.status === 200) {
        openRepo();
      }
    } catch (err) {
      console.error("Error fetching file structure:", err);
    }
  };

  const openRepo = async () => {
    setSelectedFile("");
    setSelectedFileAbsolutePath("");
    socket.emit("get_pwd");

    const handlePwd = (data: string) => {
      const match = data.match(/(\/[^\s]+)/);
      if (match) {
        const currentDir = match[1];
        if (!currentDir.includes(":")) {
          setPwd(currentDir);
        }
      }
    };

    socket.once("receive_pwd", handlePwd);
    socket.emit("clear_terminal");
    fetchRepoData();
  };

  const fetchRepoData = async () => {
    if (pwd) {
      setExplorerLoadingStatus(true);

      try {
        console.log("Current Directory:", pwd);
        const response = await axios.get(`${SERVER_URL}/repo/open_repo`, {
          params: { pwd },
          withCredentials: true,
        });

        if (response.status === 200) {
          setFileStructure(response.data.fileStructure);
        }
        console.log("openRepo", response.data);
      } catch (error) {
        console.log("Error opening repository:", error);
      } finally {
        setExplorerLoadingStatus(false);
      }
    }
  };

  useEffect(() => {
    const handleConnect = () => {
      console.log("Connected with socket ID:", socket.id);
    };

    socket.on("connect", handleConnect);
    return () => {
      socket.off("connect", handleConnect);
    };
  }, []);

  useEffect(() => {
    if (selectedFile) {
      socket.emit("get_pwd");

      const handlePwd = (data: string) => {
        const match = data.match(/(\/[^\s]+)/);
        if (match) {
          const currentDir = match[1];
          if (!currentDir.includes(":")) {
            setPwd(currentDir);
          }
        }
      };

      socket.once("receive_pwd", handlePwd);
      socket.emit("clear_terminal");
      setSelectedFileAbsolutePath(`${pwd}${selectedFile}`);
    }
  }, [pwd, selectedFile]);

  return (
    <div className="flex flex-col h-screen w-full text-sm">
      <div className="flex-grow mt-12 w-full overflow-hidden">
        <Editor
          projectName={projectName}
          createTemplate={createTemplate}
          fileStructure={fileStructure}
          setSelectedFile={setSelectedFile}
          explorerloadingStatus={explorerloadingStatus}
          selectedFileAbsolutePath={selectedFileAbsolutePath}
        />
      </div>
      <div className="h-56 border-t border-gray-600 rounded-lg w-full">
        <Terminal selectedFile={selectedFile} openRepo={openRepo} />
      </div>
    </div>
  );
};

export default Playground;
