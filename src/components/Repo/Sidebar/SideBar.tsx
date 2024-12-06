import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RiArrowUpWideFill, RiArrowDownWideFill } from "react-icons/ri";
import { SlLogout } from "react-icons/sl";
import { socket } from "@/utils/Socket";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { TiDocumentText } from "react-icons/ti";
import { FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { SidebarTabs } from "@/utils/types/types";

interface SideBarProps {
  isExplorerVisible: boolean;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  handleSidebarTabSwitch: (tab: SidebarTabs) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const SideBar: React.FC<SideBarProps> = React.memo(({
  isExplorerVisible,
  isFullScreen,
  toggleFullScreen,
  handleSidebarTabSwitch,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log("Logging out...");
        socket.disconnect();
        navigate("/auth");
      } else {
        console.log("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="h-full w-12 bg-zinc-950 flex flex-col justify-between items-center p-1 lg:px-0 md:px-0 sm:px-0 py-3">
      <div className="flex flex-col gap-4 items-center">
        <div
          id="toggle-explorer"
          className="p-1  bg-gray-900 rounded-full cursor-pointer hover:bg-gray-800 transition-all duration-300"
          onClick={() => handleSidebarTabSwitch(SidebarTabs.EXPLORER)}
        >
          {isExplorerVisible ? (
            <RiArrowDownWideFill className="text-yellow-400 text-2xl" />
          ) : (
            <RiArrowUpWideFill className="text-yellow-400 text-2xl" />
          )}
        </div>

        <div
          onClick={() => handleSidebarTabSwitch(SidebarTabs.GIT)}
          id="git"
          className="text-sm text-white hover:text-yellow-400 transition-colors cursor-pointer"
        >
          <FaGithub size={24} />
        </div>
        <div
          onClick={() => handleSidebarTabSwitch(SidebarTabs.DOCUMENT)}
          id="doc"
          className="text-sm text-white hover:text-yellow-400 transition-colors cursor-pointer"
        >
          <TiDocumentText size={24} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <button>
          {isFullScreen ? (
            <MdFullscreenExit
              className="text-yellow-400"
              onClick={toggleFullScreen}
              size={27}
            />
          ) : (
            <MdFullscreen
              className="text-yellow-400"
              onClick={toggleFullScreen}
              size={27}
            />
          )}
        </button>

        <Button
          onClick={handleLogout}
          className="bg-gray-900 hover:bg-gray-800 p-1 sm:p-2 lg:p-3 md:p-3 rounded-full shadow-lg transition-all duration-300 flex justify-center items-center"
        >
          <SlLogout className="text-yellow-400 text-lg" />
        </Button>
      </div>
    </div>
  );
});

export default SideBar;
