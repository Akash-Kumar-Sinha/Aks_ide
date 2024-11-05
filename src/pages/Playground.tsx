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
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [pwd, setPwd] = useState<string>("");
  const projectName = useRef<HTMLInputElement>(null);

  const createTemplate = async () => {
    if (!userProfile) return;
    setLoadingStatus(true);
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
        await getFiles(name); // Pass the project name directly to getFiles
      }
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  const getFiles = async (name: string) => {
    if (!name) {
      console.log("Repository name is missing.");
      return;
    }

    try {
      setLoadingStatus(true);
      const response = await axios.post(
        `${SERVER_URL}/repo/files`,
        { name },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setFileStructure(response.data.fileStructure);
      }
    } catch (err) {
      console.error("Error fetching file structure:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    const handlePwd = (data: string) => {
      const match = data.match(/(\/[^\s]+)/);
      if (match) {
        const currentDir = match[1];
        if (!currentDir.includes(":")) {
          setPwd(currentDir);
        }
      }
    };

    socket.on("receive_pwd", handlePwd);
    return () => {
      socket.off("receive_pwd", handlePwd);
    };
  }, []);

  const openRepo = async () => {
    socket.emit("get_pwd");
    socket.emit("clear_terminal");
    if (pwd) {
      console.log("Current Directory:", pwd);
      const response = await axios.get(`${SERVER_URL}/repo/open_repo`, {
        params: { pwd },
        withCredentials: true,
      });
      if (response.status === 200) {
        console.log(response.data.fileStructure);
      }
      console.log("openRepo", response.data);
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

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 text-sm">
      <div className="flex-grow mt-12 w-full">
        <Editor
          projectName={projectName}
          createTemplate={createTemplate}
          fileStructure={fileStructure}
          setSelectedFile={setSelectedFile}
        />
      </div>
      <div className="h-56 border-t border-gray-600 rounded-lg w-full">
        <Terminal selectedFile={selectedFile} openRepo={openRepo} />
      </div>
    </div>
  );
};

export default Playground;
