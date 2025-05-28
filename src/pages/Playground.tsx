import { useCallback, useEffect, useRef, useState } from "react";
import useUserProfile from "@/utils/useUserProfile";
import SideBar from "@/components/Repo/Sidebar/SideBar";
import Explorer from "@/components/Repo/Sidebar/Explorer";
import Terminal from "@/components/Repo/Terminal";
import { SidebarTabs } from "@/utils/types/types";
import socket from "@/utils/Socket";
import CodeEditor from "@/components/Repo/CodeEditor";

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
  const [isExplorerVisible, setExplorerVisible] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTabs>(
    SidebarTabs.EXPLORER
  );
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

  const projectName = useRef<HTMLInputElement>(null);

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

  const handleSidebarTabSwitch = useCallback(
    (tab: SidebarTabs) => {
      switch (tab) {
        case SidebarTabs.EXPLORER:
          if (activeSidebarTab === SidebarTabs.EXPLORER) {
            setExplorerVisible((prev) => !prev);
          } else {
            setExplorerVisible(true);
          }
          setActiveSidebarTab(SidebarTabs.EXPLORER);
          break;

        case SidebarTabs.GIT:
          if (activeSidebarTab === SidebarTabs.GIT) {
            setExplorerVisible((prev) => !prev);
          } else {
            setExplorerVisible(true);
          }
          setActiveSidebarTab(SidebarTabs.GIT);
          break;

        case SidebarTabs.DOCUMENT:
          if (activeSidebarTab === SidebarTabs.DOCUMENT) {
            setExplorerVisible((prev) => !prev);
          } else {
            setExplorerVisible(true);
          }
          setActiveSidebarTab(SidebarTabs.DOCUMENT);
          break;

        default:
          console.error("Unhandled tab:", tab);
          setExplorerVisible(false);
          break;
      }
    },
    [activeSidebarTab]
  );

  const createTemplate = () => {
    socket.emit("create_repo", {
      email: userProfile?.email,
      project_name: projectName.current?.value,
    });
  };

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
    <div className="flex flex-col w-full h-full relative">
      <div className=" h-full flex">
        <div className="relative">
          <SideBar
            toggleFullScreen={toggleFullScreen}
            isFullScreen={isFullScreen}
            isExplorerVisible={isExplorerVisible}
            handleSidebarTabSwitch={(tab: SidebarTabs) =>
              handleSidebarTabSwitch(tab)
            }
          />
        </div>
        <div
          className={`transition-transform duration-300 ease-in-out flex-shrink-0 bg-zinc-900 border-r border-zinc-800 ${
            isExplorerVisible ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ overflow: isExplorerVisible ? "visible" : "hidden" }}
        >
          {isExplorerVisible && (
            <Explorer
              projectName={projectName}
              createTemplate={createTemplate}
              fileStructure={fileStructure}
              explorerloadingStatus={explorerloadingStatus}
              handleSelect={handleSelect}
              activeSidebarTab={activeSidebarTab}
              setSelectedFileAbsolutePath={setSelectedFileAbsolutePath}
            />
          )}
        </div>
        <CodeEditor
          selectedFileAbsolutePath={selectedFileAbsolutePath}
          selectedFile={selectedFile}
          onSaveStatusChange={handleSaveStatusChange}
        />
      </div>

      <Terminal
        saveStatus={saveStatus}
        openRepo={openRepo}
        explorerloadingStatus={explorerloadingStatus}
        selectedFile={selectedFile}
      />
    </div>
  );
};

export default Playground;
