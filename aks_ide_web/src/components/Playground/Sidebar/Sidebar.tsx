import { useRef, useState } from "react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../ui/Tabs/Tabs";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { FaGithub } from "react-icons/fa";
import { ChevronLeft, ChevronRight, FoldersIcon } from "lucide-react";
import { Avatar } from "../../ui/Avatar/Avatar";
import Explorer from "./SidbarStructure/Explorer";
import GitBranch from "./SidbarStructure/GitBranch";
import { TiDocumentText } from "react-icons/ti";
import Document from "./SidbarStructure/Document";
import { Button } from "../../ui/Button/Button";
import useUserProfile from "../../../utils/useUserProfile";
import socket from "../../../utils/Socket";
import Auth from "../../../pages/Auth";
import Profile from "./SidbarStructure/Profile";
import useTheme from "../../ui/lib/useTheme";

interface SidebarProps {
  toggleFullScreen: () => void;
  isFullScreen: boolean;
  fileStructure: Record<string, unknown>;
  explorerloadingStatus?: boolean;
  handleSelect: (path: string) => void;
  setSelectedFileAbsolutePath: (absolutePath: string) => void;
}

const Sidebar = ({
  toggleFullScreen,
  isFullScreen,
  fileStructure,
  explorerloadingStatus = false,
  handleSelect,
  setSelectedFileAbsolutePath,
}: SidebarProps) => {
  const { theme } = useTheme();
  const { userProfile } = useUserProfile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("explorer");
  const projectName = useRef<HTMLInputElement>(null);

  const createTemplate = () => {
    socket.emit("create_repo", {
      email: userProfile?.email,
      project_name: projectName.current?.value,
    });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);

    if (!isCollapsed && activeTab === "sidebar") {
      setActiveTab("explorer");
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "fullscreen") {
      toggleFullScreen();
      return;
    }

    setActiveTab(value);

    if (isCollapsed && value !== "sidebar") {
      setIsCollapsed(false);
    }
  };

  return (
    <div className="flex h-full sidebar-container relative">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        variant="default"
        scale="lg"
        orientation="vertical"
        className="h-full"
      >
        <div className="flex">
          <TabsList
            orientation="vertical"
            className="flex items-center relative"
            style={{
              backgroundColor: theme.backgroundColor,
              borderRight: `1px solid ${theme.secondaryColor}30`,
            }}
          >
            <Button
              onClick={toggleCollapse}
              className="my-4"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <ChevronLeft size={16} />
              )}
            </Button>

            <TabsTrigger
              value="explorer"
              icon={<FoldersIcon size={16} />}
              className="flex items-center justify-center"
              title="Explorer"
            >
              <span className="sr-only">Explorer</span>
            </TabsTrigger>

            <TabsTrigger
              value="github"
              icon={<FaGithub size={16} />}
              className="flex items-center justify-center"
              title="GitHub"
            >
              <span className="sr-only">GitHub</span>
            </TabsTrigger>

            <TabsTrigger
              value="fullscreen"
              className="flex items-center justify-center"
              title="Fullscreen"
            >
              <button
                onClick={toggleFullScreen}
                className="flex items-center justify-center"
                title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullScreen ? (
                  <MdFullscreenExit className="w-5 h-5" />
                ) : (
                  <MdFullscreen className="w-5 h-5" />
                )}
                <span className="sr-only">
                  {isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                </span>
              </button>
            </TabsTrigger>

            <TabsTrigger
              value="document"
              className="flex items-center justify-center"
              title="Document"
            >
              <TiDocumentText className="w-5 h-5" />
              <span className="sr-only">Document</span>
            </TabsTrigger>

            {userProfile ? (
              <TabsTrigger
                value="profile"
                className="flex items-center justify-center"
                title="Profile"
              >
                <Avatar
                  image={userProfile.avatar}
                  fallback={userProfile.name || userProfile.email}
                  variant="minimal"
                  scale="sm"
                  className="w-8 h-8"
                />
                <span className="sr-only">Profile</span>
              </TabsTrigger>
            ) : (
              <div className="p-2">
                <Auth />
              </div>
            )}
          </TabsList>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              isCollapsed ? "w-0" : "w-80"
            }`}
            style={{
              backgroundColor: theme.backgroundColor,
              borderRight: !isCollapsed
                ? `1px solid ${theme.secondaryColor}20`
                : "none",
            }}
          >
            <div className="w-80 h-full overflow-y-auto">
              <TabsContent value="explorer" className="h-full">
                <Explorer
                  projectName={projectName}
                  createTemplate={createTemplate}
                  fileStructure={fileStructure}
                  explorerloadingStatus={explorerloadingStatus}
                  handleSelect={handleSelect}
                  setSelectedFileAbsolutePath={setSelectedFileAbsolutePath}
                />
              </TabsContent>

              <TabsContent value="github" className="h-full">
                <GitBranch />
              </TabsContent>

              <TabsContent value="document" className="h-full">
                <Document />
              </TabsContent>

              {userProfile && (
                <TabsContent value="profile" className="h-full">
                  <Profile />
                </TabsContent>
              )}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Sidebar;
