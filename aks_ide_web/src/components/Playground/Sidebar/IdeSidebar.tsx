import { useRef, useState } from "react";
import { FaGithub, FaStickyNote } from "react-icons/fa";
import { FoldersIcon } from "lucide-react";
import { TiDocumentText } from "react-icons/ti";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import Explorer from "./SidbarStructure/Explorer";
import GitBranch from "./SidbarStructure/GitBranch";
import Document from "./SidbarStructure/Document";
import Profile from "./SidbarStructure/Profile";
import Note from "./SidbarStructure/Note";
import Auth from "../../../pages/Auth";
import useUserProfile from "../../../utils/useUserProfile";
import socket from "../../../utils/Socket";

interface IdeSidebarProps {
  toggleFullScreen: () => void;
  isFullScreen: boolean;
  fileStructure: Record<string, unknown>;
  explorerloadingStatus?: boolean;
  handleSelect: (path: string) => void;
  setSelectedFileAbsolutePath: (absolutePath: string) => void;
}

const sidebarItems = [
  {
    id: "explorer",
    label: "Explorer",
    icon: FoldersIcon,
  },
  {
    id: "github",
    label: "GitHub",
    icon: FaGithub,
  },
  {
    id: "document",
    label: "Document",
    icon: TiDocumentText,
  },
  {
    id: "notes",
    label: "Notes",
    icon: FaStickyNote,
  },
];

export function IdeSidebar({
  toggleFullScreen,
  isFullScreen,
  fileStructure,
  explorerloadingStatus = false,
  handleSelect,
  setSelectedFileAbsolutePath,
}: IdeSidebarProps) {
  const { userProfile } = useUserProfile();
  const [activeView, setActiveView] = useState("explorer");
  const projectName = useRef<HTMLInputElement>(null);

  const createTemplate = () => {
    socket.emit("create_repo", {
      email: userProfile?.email,
      project_name: projectName.current?.value,
    });
  };

  const renderContent = () => {
    switch (activeView) {
      case "explorer":
        return (
          <Explorer
            projectName={projectName}
            createTemplate={createTemplate}
            fileStructure={fileStructure}
            explorerloadingStatus={explorerloadingStatus}
            handleSelect={handleSelect}
            setSelectedFileAbsolutePath={setSelectedFileAbsolutePath}
          />
        );
      case "github":
        return <GitBranch />;
      case "document":
        return <Document />;
      case "notes":
        return <Note />;
      case "profile":
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      <div className="w-12 bg-[#000000] border-r border-[#1a1a1a] flex flex-col">
        <div className="flex-1 py-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveView(item.id)}
              className={`w-full h-10 mb-1 text-[#808080] hover:text-[#cccccc] hover:bg-[#1a1a1a] ${
                activeView === item.id ? "bg-blue-600 text-white" : ""
              }`}
              title={item.label}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div className="border-t border-[#1a1a1a] py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullScreen}
            className="w-full h-10 mb-1 text-[#808080] hover:text-[#cccccc] hover:bg-[#1a1a1a]"
            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullScreen ? (
              <MdFullscreenExit className="h-4 w-4" />
            ) : (
              <MdFullscreen className="h-4 w-4" />
            )}
          </Button>

          {userProfile ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("profile")}
              className={`w-full h-10 text-[#808080] hover:text-[#cccccc] hover:bg-[#1a1a1a] ${
                activeView === "profile" ? "bg-blue-600 text-white" : ""
              }`}
              title="Profile"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage
                  src={userProfile.avatar}
                  alt={userProfile.name || userProfile.email}
                />
                <AvatarFallback className="text-xs bg-[#1a1a1a] text-[#569cd6]">
                  {(userProfile.name || userProfile.email)
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <div className="px-1">
              <Auth />
            </div>
          )}
        </div>
      </div>

      <div className="w-80 bg-[#1a1a1a] border-r border-[#333333] flex flex-col">
        <div className="h-full overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
}

export default IdeSidebar;
