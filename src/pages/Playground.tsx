import { useCallback, useEffect, useRef, useState } from "react";
import useUserProfile from "@/utils/useUserProfile";
import SideBar from "@/components/Repo/Sidebar/SideBar";
import Explorer from "@/components/Repo/Sidebar/Explorer";
import Terminal from "@/components/Repo/Terminal";
import { SidebarTabs } from "@/utils/types/types";
import apiClient from "@/utils/apiClient";
import { getAccessTokenFromLocalStorage } from "@/utils/getAccessTokenFromLocalStorage";
import socket from "@/utils/Socket";
import CodeEditor from "@/components/Repo/CodeEditor";

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
  const [isExplorerVisible, setExplorerVisible] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTabs>(
    SidebarTabs.EXPLORER
  );

  const handleSelect = useCallback((path: string) => {
    setSelectedFile(path);
    console.log(path);
  }, []);

  const projectName = useRef<HTMLInputElement>(null);

  const getFiles = useCallback(async () => {
    console.log("getFiles called");
    if (!userProfile || !projectName.current) return;
    const name = projectName.current.value;
    if (!name) {
      console.log("Repository name is missing.");
      return;
    }

    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await apiClient.post(
        `${SERVER_URL}/repo/files`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.status === 200) {
        setFileStructure(response.data.fileStructure);
      }
    } catch (err) {
      console.error("Error fetching file structure:", err);
    }
  }, [userProfile]);

  const fetchRepoData = useCallback(async () => {
    console.log("fetchRepoData called");
    if (pwd) {
      setExplorerLoadingStatus(true);

      try {
        const accessToken = getAccessTokenFromLocalStorage();
        const response = await apiClient.get(`${SERVER_URL}/repo/open_repo`, {
          params: { pwd },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 200) {
          setFileStructure(response.data.fileStructure);
        }
      } catch (error) {
        console.error("Error opening repository:", error);
      } finally {
        setExplorerLoadingStatus(false);
      }
    }
  }, [pwd]);

  const openRepo = useCallback(() => {
    console.log("openRepo called");
    if (!userProfile?.email) return;

    setExplorerLoadingStatus(true);
    setFileStructure({}); // Clear existing structure

    // Emit the socket event to get repo structure
    socket.emit("repo_tree", { email: userProfile.email });
  }, [userProfile?.email]);

  useEffect(() => {
    if (!userProfile?.email) return;

    const handleRepoStructure = (data: Record<string, unknown>) => {
      console.log("Received repo structure:", data);
      setFileStructure(data);
      setExplorerLoadingStatus(false);
    };

    const handleTerminalError = (error: string) => {
      console.error("Terminal error:", error);
      setExplorerLoadingStatus(false);
    };

    // Set up socket listeners
    socket.on("repo_structure", handleRepoStructure);
    socket.on("terminal_error", handleTerminalError);

    // Clean up listeners
    return () => {
      socket.off("repo_structure", handleRepoStructure);
      socket.off("terminal_error", handleTerminalError);
    };
  }, [userProfile?.email]);

  const updateFilePath = useCallback(() => {
    if (pwd && selectedFile) {
      setSelectedFileAbsolutePath(`${pwd}/${selectedFile}`);
    }
  }, [pwd, selectedFile]);

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

  useEffect(() => {
    updateFilePath();
  }, [pwd, selectedFile, updateFilePath]);

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

  useEffect(() => {
    if (pwd) {
      fetchRepoData();
    }
  }, [fetchRepoData, pwd]);

  return (
    <div className="flex flex-col w-full h-full">
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
            />
          )}
        </div>
        <CodeEditor
          selectedFileAbsolutePath={selectedFileAbsolutePath}
          selectedFile={selectedFile}
        />
      </div>

      <Terminal
        openRepo={openRepo}
        explorerloadingStatus={explorerloadingStatus}
        selectedFile={selectedFile}
      />
    </div>
  );
};

export default Playground;
