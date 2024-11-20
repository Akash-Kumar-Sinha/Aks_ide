import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RiArrowUpWideFill, RiArrowDownWideFill } from "react-icons/ri";
import { SlLogout } from "react-icons/sl";
import { socket } from "@/utils/Socket";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

import { Button } from "@/components/ui/button";

interface SideBarProps {
  isExplorerVisible: boolean;
  toggleExplorer: () => void;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const SideBar: React.FC<SideBarProps> = ({
  isExplorerVisible,
  toggleExplorer,
  isFullScreen,
  toggleFullScreen,
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
    <div className="h-full w-16 bg-zinc-950 flex flex-col justify-between items-center py-4">
      <div className="flex flex-col gap-4 items-center">
        <div
          id="toggle-explorer"
          className="p-3 bg-gray-900 rounded-full cursor-pointer hover:bg-gray-800 transition-all duration-300"
          onClick={toggleExplorer}
        >
          {isExplorerVisible ? (
            <RiArrowDownWideFill className="text-yellow-400 text-2xl" />
          ) : (
            <RiArrowUpWideFill className="text-yellow-400 text-2xl" />
          )}
        </div>

        <div
          id="git"
          className="text-sm text-white hover:text-yellow-400 transition-colors cursor-pointer"
        >
          Git
        </div>
      </div>
      <div className="flex flex-col items-center gap-4">
        <button>
          {isFullScreen ? (
            <MdFullscreenExit onClick={toggleFullScreen} size={27} />
          ) : (
            <MdFullscreen onClick={toggleFullScreen} size={27} />
          )}
        </button>

        <Button
          onClick={handleLogout}
          className="bg-gray-900 hover:bg-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 flex justify-center items-center"
        >
          <SlLogout className="text-yellow-400 text-lg" size={27}/>
        </Button>
      </div>
    </div>
  );
};

export default SideBar;
