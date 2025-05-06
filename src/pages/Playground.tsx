import { useCallback, useEffect, useRef, useState } from "react";

import { socket } from "@/utils/Socket";
import useUserProfile from "@/utils/useUserProfile";
import SideBar from "@/components/Repo/Sidebar/SideBar";
import Explorer from "@/components/Repo/Sidebar/Explorer";
import CodeEditor from "@/components/Repo/CodeEditor";
import Terminal from "@/components/Repo/Terminal";
import { SidebarTabs } from "@/utils/types/types";
import apiClient from "@/utils/apiClient";
import { getAccessTokenFromLocalStorage } from "@/utils/getAccessTokenFromLocalStorage";
import toast from "react-hot-toast";

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
  }, []);

  const projectName = useRef<HTMLInputElement>(null);

  const fetchPwd = useCallback((data: string) => {
    const match = data.match(/(\/[^\s]+)/);
    if (match) {
      const currentDir = match[1];
      if (!currentDir.includes(":")) {
        setPwd(currentDir);
      }
    }
  }, []);

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

  const openRepo = useCallback(async () => {
    console.log("openRepo called");
    setSelectedFile("");
    setSelectedFileAbsolutePath("");
    socket.emit("get_pwd");
    socket.once("receive_pwd", fetchPwd);
    socket.emit("clear_terminal");
    fetchRepoData();
  }, [fetchPwd, fetchRepoData]);

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

  // useEffect(() => {
  //   const handleConnect = () => {
  //     console.log("Connected with socket ID:", socket.id);
  //     toast.success(`Connected with socket server ${socket.id}`);
  //     if (userProfile) {
  //       socket.emit("load_terminal", { email: userProfile.email });
  //     }
  //   };
  //   if (userProfile) {
  //     socket.on("connect", handleConnect);
  //   }
  //   return () => {
  //     socket.off("connect", handleConnect);
  //   };
  // }, [userProfile]);

  useEffect(() => {
    // Add more detailed connection logging
    console.log("Socket state:", socket);
    console.log("Attempting to connect to server...");
  
    // Listen for all socket lifecycle events
    socket.on("connect", () => {
      console.log("Connected with socket ID:", socket.id);
      toast.success(`Connected with socket server ${socket.id}`);
      if (userProfile) {
        console.log("Emitting load_terminal with profile:", userProfile.email);
        socket.emit("load_terminal", { email: userProfile.email });
      }
    });
  
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      toast.error(`Socket connection error: ${error.message}`);
    });
  
    socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      toast.error(`Socket disconnected: ${reason}`);
    });
  
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, [userProfile]);

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
    <div className="w-screen h-full flex border-r border-zinc-900">
      {/* <div className="relative h-full flex border-t border-zinc-900 w-full">
        <SideBar
          toggleFullScreen={toggleFullScreen}
          isFullScreen={isFullScreen}
          isExplorerVisible={isExplorerVisible}
          handleSidebarTabSwitch={(tab: SidebarTabs) =>
            handleSidebarTabSwitch(tab)
          }
        />
        <div
          className={`transition-transform duration-300 ease-in-out flex-shrink-0 bg-zinc-900 border-r border-zinc-800 ${
            isExplorerVisible ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ overflow: isExplorerVisible ? "visible" : "hidden" }}
        >
          {isExplorerVisible && (
            <Explorer
              projectName={projectName}
              createTemplate={getFiles}
              fileStructure={fileStructure}
              explorerloadingStatus={explorerloadingStatus}
              handleSelect={handleSelect}
              activeSidebarTab={activeSidebarTab}
              isExplorerVisible={isExplorerVisible}
            />
          )}
        </div>

        <div className="flex flex-col flex-grow overflow-hidden">
          <div className="flex-grow flex flex-col overflow-hidden">
            <CodeEditor
              selectedFile={selectedFile}
              selectedFileAbsolutePath={selectedFileAbsolutePath}
            />
          </div> */}

      <div className="h-56">
        <Terminal selectedFile={selectedFile} openRepo={openRepo} />
      </div>
      {/* </div>
      </div> */}
    </div>
  );
};

export default Playground;
