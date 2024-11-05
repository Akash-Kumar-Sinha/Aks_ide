import React from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RiArrowUpWideFill, RiArrowDownWideFill } from "react-icons/ri";
import { socket } from "@/utils/Socket";
import { SlLogout } from "react-icons/sl";

interface SideBarProps {
  isExplorerVisible: boolean;
  toggleExplorer: () => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const SideBar: React.FC<SideBarProps> = ({
  isExplorerVisible,
  toggleExplorer,
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
    <div className="h-full w-16 bg-[#1F1F1F] flex flex-col text-center p-2 shadow-lg rounded-lg transition-all duration-300 ease-in-out z-10">
      <div className="h-full bg-[#27272A] p-4 rounded-lg flex flex-col items-center gap-6">
        <div
          id="logo"
          className="text-white font-bold text-2xl transition-transform duration-300 ease-in-out transform hover:scale-110"
        >
          Aks
        </div>
        <div
          id="toggle"
          className="border border-gray-600 flex justify-center items-center rounded-full p-2 transition-all duration-300 ease-in-out hover:bg-gray-700 cursor-pointer"
          onClick={toggleExplorer}
        >
          {isExplorerVisible ? (
            <RiArrowDownWideFill className="text-white text-2xl" />
          ) : (
            <RiArrowUpWideFill className="text-white text-2xl" />
          )}
        </div>
        <div className="text-white transition-transform duration-300 ease-in-out transform hover:scale-110">
          Git
        </div>
        <Button
          onClick={handleLogout}
          className="flex justify-center items-center mt-6 w-full py-3 bg-[#593CA1] text-white font-semibold rounded-2xl hover:bg-[#442d7d] transition-all duration-300 shadow-lg"
        >
          <SlLogout />
        </Button>
      </div>
    </div>
  );
};

export default SideBar;
