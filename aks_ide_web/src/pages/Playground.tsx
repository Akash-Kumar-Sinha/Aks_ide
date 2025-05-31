import { useCallback, useEffect, useState } from "react";
import Terminal from "../components/Playground/Terminal";
import socket from "../utils/Socket";
import useUserProfile from "../utils/useUserProfile";
import Sidebar from "../components/Playground/Sidebar/Sidebar";
import CodeEditor from "../components/Playground/CodeEditor";

export type FileStructure = {
  [key: string]: FileStructure | { [absolutePath: string]: string } | string;
};

export type SaveStatus = "idle" | "saving" | "saved" | "error";

const Playground = () => {
  const { userProfile } = useUserProfile();
  const [fileStructure, setFileStructure] = useState<FileStructure>({});
  const [explorerloadingStatus, setExplorerLoadingStatus] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileAbsolutePath, setSelectedFileAbsolutePath] = useState("");
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const handleSelect = useCallback((path: string) => {
    setSelectedFile(path);
    console.log(path);
  }, []);

  const handleSaveStatusChange = useCallback(
    (status: "idle" | "saving" | "saved" | "error") => {
      setSaveStatus(status);
    },
    []
  );

  const openRepo = useCallback(() => {
    console.log("openRepo called");
    if (!userProfile?.email) return;

    setExplorerLoadingStatus(true);
    setFileStructure({});

    socket.emit("repo_tree", { email: userProfile.email });
  }, [userProfile?.email]);

  useEffect(() => {
    if (!userProfile?.email) return;

    const handleRepoStructure = (data: FileStructure) => {
      console.log("Received repo structure:", data);
      setFileStructure(data);
      setExplorerLoadingStatus(false);
    };

    const handleTerminalError = (error: string) => {
      console.error("Terminal error:", error);
      setExplorerLoadingStatus(false);
    };

    socket.on("repo_structure", handleRepoStructure);
    socket.on("terminal_error", handleTerminalError);

    return () => {
      socket.off("repo_structure", handleRepoStructure);
      socket.off("terminal_error", handleTerminalError);
    };
  }, [userProfile?.email]);

  const toggleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Failed to enter full-screen mode:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Failed to exit full-screen mode:", err);
      });
      window.dispatchEvent(new Event("resize"));
    }
  }, [isFullScreen]);

  useEffect(() => {
    const onFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);

      if (!document.fullscreenElement) {
        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 100);
      }
    };

    document.addEventListener("fullscreenchange", onFullScreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
    };
  }, []);

  console.log("selectedFileAbsolutePath: ", selectedFileAbsolutePath);

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden">
      <div className="flex flex-1 min-h-0 h-3/5">
        <div className="flex-shrink-0">
          <Sidebar
            toggleFullScreen={toggleFullScreen}
            isFullScreen={isFullScreen}
            fileStructure={fileStructure}
            explorerloadingStatus={explorerloadingStatus}
            handleSelect={handleSelect}
            setSelectedFileAbsolutePath={setSelectedFileAbsolutePath}
          />
        </div>

        <div className="flex-1 min-w-0">
          <CodeEditor
            selectedFileAbsolutePath={selectedFileAbsolutePath}
            selectedFile={selectedFile}
            onSaveStatusChange={handleSaveStatusChange}
          />
        </div>
      </div>

      <div className="flex-shrink-0 h-2/5 min-h-[300px]">
        <Terminal
          saveStatus={saveStatus}
          openRepo={openRepo}
          explorerloadingStatus={explorerloadingStatus}
          selectedFile={selectedFile}
        />
      </div>
    </div>
  );
};

export default Playground;
