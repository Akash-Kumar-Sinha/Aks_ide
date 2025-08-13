import { useCallback, useEffect, useState } from "react";
import Terminal from "../components/Playground/Terminal";
import socket from "../utils/Socket";
import useUserProfile from "../utils/useUserProfile";
import Sidebar from "../components/Playground/Sidebar/IdeSidebar";
import CodeEditor from "../components/Playground/CodeEditor";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

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
  }, []);

  const handleSaveStatusChange = useCallback(
    (status: "idle" | "saving" | "saved" | "error") => {
      setSaveStatus(status);
    },
    []
  );

  const openRepo = useCallback(() => {
    if (!userProfile?.email) return;

    setExplorerLoadingStatus(true);
    setFileStructure({});

    socket.emit("repo_tree", { email: userProfile.email });
  }, [userProfile?.email]);

  useEffect(() => {
    if (!userProfile?.email) return;

    const handleRepoStructure = (data: FileStructure) => {
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

  return (
    <motion.div
      className="flex w-full h-screen overflow-hidden bg-[var(--color-background)]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Sidebar
        toggleFullScreen={toggleFullScreen}
        isFullScreen={isFullScreen}
        fileStructure={fileStructure}
        explorerloadingStatus={explorerloadingStatus}
        handleSelect={handleSelect}
        setSelectedFileAbsolutePath={setSelectedFileAbsolutePath}
      />
      <main className="flex flex-col flex-1 min-w-0">
        <Card className="flex-1 min-h-0 p-0 bg-[var(--color-card)]">
          <CodeEditor
            selectedFileAbsolutePath={selectedFileAbsolutePath}
            selectedFile={selectedFile}
            onSaveStatusChange={handleSaveStatusChange}
          />
        </Card>
        <Card className="flex-shrink-0 h-[40vh] min-h-[300px] max-h-[50vh] border-t border-[var(--color-border)] shadow-lg bg-[var(--color-card)]">
          <Terminal
            saveStatus={saveStatus}
            openRepo={openRepo}
            explorerloadingStatus={explorerloadingStatus}
            selectedFile={selectedFile}
          />
        </Card>
      </main>
    </motion.div>
  );
};

export default Playground;
