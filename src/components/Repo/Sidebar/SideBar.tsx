import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RiArrowUpWideFill, RiArrowDownWideFill } from "react-icons/ri";
import { SlLogout } from "react-icons/sl";
import { socket } from "@/utils/Socket";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { TiDocumentText } from "react-icons/ti";
import { FaGithub } from "react-icons/fa";
import { SidebarTabs } from "@/utils/types/types";
import apiClient from "@/utils/apiClient";
import { getAccessTokenFromLocalStorage } from "@/utils/getAccessTokenFromLocalStorage";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useUserProfile from "@/utils/useUserProfile";
import Loading from "@/components/Loading";
import LoginPopUp from "@/components/LoginPopUp";

interface SideBarProps {
  isExplorerVisible: boolean;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  handleSidebarTabSwitch: (tab: SidebarTabs) => void;
  activeSidebarTab?: SidebarTabs;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const SideBar: React.FC<SideBarProps> = React.memo(
  ({
    isExplorerVisible,
    isFullScreen,
    toggleFullScreen,
    handleSidebarTabSwitch,
    activeSidebarTab,
  }) => {
    const navigate = useNavigate();
    const { userProfile, loading } = useUserProfile();
    const [profileUrl, setProfileUrl] = useState<string | undefined>(undefined);

    const profileSettings = () => {
      navigate("/profile");
    };

    const handleLogout = async () => {
      try {
        const accessToken = getAccessTokenFromLocalStorage();
        const response = await apiClient.post(
          `${SERVER_URL}/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (response.status === 200) {
          console.log("Logging out...");
          localStorage.removeItem(import.meta.env.VITE_ACCESS_TOKEN_NAME);
          socket.disconnect();
          navigate("/auth");
        } else {
          console.log("Logout failed");
        }
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    useEffect(() => {
      if (userProfile) {
        setProfileUrl(userProfile.avatar);
      }
    }, [userProfile]);

    const SidebarButton = ({
      children,
      onClick,
      isActive = false,
      tooltip,
      className = "",
    }: {
      children: React.ReactNode;
      onClick: () => void;
      isActive?: boolean;
      tooltip: string;
      className?: string;
    }) => (
      <div className="relative group">
        <button
          onClick={onClick}
          className={`
            relative flex items-center justify-center w-11 h-11 rounded-2xl
            transition-all duration-300 ease-out group
            ${
              isActive
                ? "bg-purple-600/90 text-white shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/30"
                : "bg-zinc-800/60 text-zinc-400 hover:bg-purple-600/20 hover:text-purple-300"
            }
            hover:scale-110 active:scale-95 backdrop-blur-lg
            border border-zinc-700/50 hover:border-purple-500/40
            ${isActive ? "border-purple-400/50" : ""}
            ${className}
          `}
        >
          <div
            className={`relative z-10 transition-transform duration-200 ${
              isActive ? "scale-110" : "group-hover:scale-105"
            }`}
          >
            {children}
          </div>

          {isActive && (
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-md animate-pulse"></div>
          )}

          {isActive && (
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full shadow-lg shadow-purple-400/50"></div>
          )}
        </button>

        <div
          className="absolute left-16 top-1/2 transform -translate-y-1/2 px-4 py-2.5 
                        bg-zinc-900/95 text-white text-sm font-medium rounded-xl 
                        opacity-0 group-hover:opacity-100 transition-all duration-300 delay-500
                        pointer-events-none whitespace-nowrap z-50 border border-zinc-700/80
                        shadow-2xl shadow-black/40 backdrop-blur-sm"
        >
          {tooltip}
          <div
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1.5 
                          w-3 h-3 bg-zinc-900/95 border-l border-b border-zinc-700/80 rotate-45"
          ></div>
        </div>
      </div>
    );

    return (
      <div
        className="flex flex-col w-16 bg-gradient-to-b from-zinc-950/95 via-zinc-900/95 to-zinc-950/95 
                      border-r border-zinc-800/60 shadow-2xl relative overflow-hidden backdrop-blur-xl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-4 w-1 h-1 bg-purple-500/30 rounded-full animate-pulse"></div>
          <div className="absolute top-32 left-8 w-0.5 h-0.5 bg-purple-400/40 rounded-full animate-ping"></div>
          <div className="absolute bottom-20 left-6 w-1 h-1 bg-purple-600/20 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-purple-600/15 via-purple-500/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-purple-600/10 via-purple-500/5 to-transparent"></div>
        </div>

        <div className="relative z-10 p-4 mb-2">
          <div className="w-8 h-8 mx-auto bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg flex items-center justify-center">
            <div
              className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg 
                          flex items-center justify-center shadow-lg shadow-purple-600/25"
            >
              <span className="text-white font-bold text-sm">A</span>
            </div>{" "}
          </div>
        </div>

        <div className="flex flex-col gap-3 px-2.5 relative z-10">
          <SidebarButton
            onClick={() => handleSidebarTabSwitch(SidebarTabs.EXPLORER)}
            isActive={activeSidebarTab === SidebarTabs.EXPLORER}
            tooltip="File Explorer"
          >
            {isExplorerVisible ? (
              <RiArrowUpWideFill className="w-5 h-5" />
            ) : (
              <RiArrowDownWideFill className="w-5 h-5" />
            )}
          </SidebarButton>

          <SidebarButton
            onClick={() => handleSidebarTabSwitch(SidebarTabs.GIT)}
            isActive={activeSidebarTab === SidebarTabs.GIT}
            tooltip="Git Repository"
          >
            <FaGithub className="w-5 h-5" />
          </SidebarButton>

          <SidebarButton
            onClick={() => handleSidebarTabSwitch(SidebarTabs.DOCUMENT)}
            isActive={activeSidebarTab === SidebarTabs.DOCUMENT}
            tooltip="Documents"
          >
            <TiDocumentText className="w-5 h-5" />
          </SidebarButton>
        </div>

        <div className="flex-1"></div>

        <div className="relative z-10 px-2.5 mb-3">
          {loading ? (
            <div className="flex items-center justify-center h-11">
              <Loading size={20} />
            </div>
          ) : !userProfile ? (
            <div className="w-11 h-11 rounded-2xl bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center group hover:bg-purple-600/20 hover:border-purple-500/40 transition-all duration-300">
              <LoginPopUp />
            </div>
          ) : (
            <div className="relative group">
              <Avatar
                onClick={profileSettings}
                className="cursor-pointer w-11 h-11 hover:scale-110 transition-all duration-300 
                         ring-2 ring-zinc-700/50 hover:ring-purple-500/60 shadow-xl"
              >
                <AvatarImage
                  src={profileUrl}
                  className="w-full h-full rounded-full object-cover"
                />
                <AvatarFallback
                  className="bg-gradient-to-br from-purple-600 to-purple-700 
                                     text-white font-bold text-sm"
                >
                  {userProfile.name
                    ? userProfile.name.charAt(0).toUpperCase()
                    : userProfile.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-500 rounded-full 
                          border-2 border-zinc-900 shadow-lg"
              >
                <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-40"></div>
              </div>

              <div
                className="absolute left-16 top-1/2 transform -translate-y-1/2 px-4 py-2.5 
                          bg-zinc-900/95 text-white text-sm font-medium rounded-xl 
                          opacity-0 group-hover:opacity-100 transition-all duration-300 delay-500
                          pointer-events-none whitespace-nowrap z-50 border border-zinc-700/80
                          shadow-2xl shadow-black/40 backdrop-blur-sm"
              >
                {userProfile.name || userProfile.email?.split("@")[0] || "User"}
                <div
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1.5 
                            w-3 h-3 bg-zinc-900/95 border-l border-b border-zinc-700/80 rotate-45"
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 px-2.5 pb-4 relative z-10">
          <SidebarButton
            onClick={toggleFullScreen}
            tooltip={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullScreen ? (
              <MdFullscreenExit className="w-5 h-5" />
            ) : (
              <MdFullscreen className="w-5 h-5" />
            )}
          </SidebarButton>

          <SidebarButton
            onClick={handleLogout}
            tooltip="Logout"
            className="hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/40"
          >
            <SlLogout className="w-4 h-4" />
          </SidebarButton>
        </div>
      </div>
    );
  }
);

export default SideBar;
