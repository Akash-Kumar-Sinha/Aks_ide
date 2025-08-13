import { useState, useRef } from "react";
import { FaGithub, FaStickyNote } from "react-icons/fa";
import { FoldersIcon } from "lucide-react";
import { TiDocumentText } from "react-icons/ti";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

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
  handleSelect,
  setSelectedFileAbsolutePath,
}: IdeSidebarProps) {
  const { userProfile } = useUserProfile();
  const [activeView, setActiveView] = useState<string | null>(null);
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
            fileStructure={fileStructure}
            createTemplate={createTemplate}
            explorerloadingStatus={false}
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
        return (
          <Explorer
            fileStructure={fileStructure}
            createTemplate={createTemplate}
            explorerloadingStatus={false}
            handleSelect={handleSelect}
            setSelectedFileAbsolutePath={setSelectedFileAbsolutePath}
          />
        );
    }
  };

  return (
    <div className="flex h-full">
      <nav className="flex flex-col border-r border-[var(--color-border)] bg-[var(--color-background)] w-16 items-center py-4 gap-2">
        {sidebarItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.08 }}>
                <Button
                  variant={activeView === item.id ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setActiveView(item.id)}
                  className={`w-10 h-10 flex items-center justify-center ${
                    activeView === item.id
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-md"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-accent)]/20"
                  } transition-all duration-200`}
                  aria-label={item.label}
                >
                  <item.icon className="h-5 w-5" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-[var(--color-card)] text-[var(--color-card-foreground)]"
            >
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
        <div className="mt-auto flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullScreen}
            className="w-10 h-10 text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-accent)]/20"
            aria-label={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullScreen ? (
              <MdFullscreenExit className="h-5 w-5" />
            ) : (
              <MdFullscreen className="h-5 w-5" />
            )}
          </Button>
          {userProfile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.08 }}>
                  <Button
                    variant={activeView === "profile" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setActiveView("profile")}
                    className={`w-10 h-10 flex items-center justify-center ${
                      activeView === "profile"
                        ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-md"
                        : "text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-accent)]/20"
                    } transition-all duration-200`}
                    aria-label="Profile"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage
                        src={userProfile.avatar}
                        alt={userProfile.name || userProfile.email}
                      />
                      <AvatarFallback className="text-xs bg-[var(--color-accent)] text-[var(--color-primary)]">
                        {(userProfile.name || userProfile.email)
                          .charAt(0)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[var(--color-card)] text-[var(--color-card-foreground)]"
              >
                Profile
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="px-1">
              <Auth />
            </div>
          )}
        </div>
      </nav>
      <div className="w-[320px] p-0 bg-[var(--color-card)] border-r border-[var(--color-border)] shadow-lg h-full overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default IdeSidebar;
