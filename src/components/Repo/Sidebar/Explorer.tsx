import React from "react";
import FileTree from "./FileTree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/Loading";
import { SidebarTabs } from "@/utils/types/types";
import Document from "./Document";
import GitBranch from "./GitBranch";
import { FolderOpen, Plus, Search, RefreshCw } from "lucide-react";

// Type definitions for the repository structure from Rust backend
interface RepoStructureResponse {
  current_directory?: string;
  structure?: FileStructure;
}

interface FileStructure {
  [key: string]: FileStructure | string[] | undefined;
  _files?: string[];
}

interface ExplorerProps {
  fileStructure: Record<string, unknown>;
  createTemplate: () => void;
  projectName: React.RefObject<HTMLInputElement>;
  explorerloadingStatus: boolean;
  handleSelect: (path: string) => void;
  activeSidebarTab: SidebarTabs;
  onRefresh?: () => void;
}

const Explorer: React.FC<ExplorerProps> = React.memo(
  ({
    fileStructure = {},
    createTemplate,
    projectName,
    explorerloadingStatus,
    handleSelect,
    activeSidebarTab,
    onRefresh,
  }) => {
    const [searchTerm, setSearchTerm] = React.useState("");

    // Type-safe extraction of the file structure from the socket response
    const getProcessedFileStructure = (): FileStructure | null => {
      try {
        // Check if fileStructure has the expected format from socket response
        const repoResponse = fileStructure as RepoStructureResponse;

        if (
          repoResponse.structure &&
          typeof repoResponse.structure === "object"
        ) {
          return repoResponse.structure;
        }

        // Fallback: check if fileStructure is already in the flat format
        if (typeof fileStructure === "object" && fileStructure !== null) {
          // Check if it looks like a FileStructure (has either _files or directory-like keys)
          const keys = Object.keys(fileStructure);
          const hasValidStructure = keys.some(
            (key) =>
              key === "_files" ||
              (typeof fileStructure[key] === "object" &&
                fileStructure[key] !== null)
          );

          if (hasValidStructure) {
            return fileStructure as FileStructure;
          }
        }

        return null;
      } catch (error) {
        console.error("Error processing file structure:", error);
        return null;
      }
    };

    const handleFileSelect = (path: string, isFile: boolean) => {
      if (isFile) {
        handleSelect(path);
      }
    };

    const getCurrentDirectory = (): string => {
      try {
        const repoResponse = fileStructure as RepoStructureResponse;
        if (
          repoResponse.current_directory &&
          typeof repoResponse.current_directory === "string"
        ) {
          return repoResponse.current_directory;
        }
        return "";
      } catch (error) {
        console.error("Error getting current directory:", error);
        return "";
      }
    };

    const hasFileStructure = (): boolean => {
      const processedStructure = getProcessedFileStructure();
      return (
        processedStructure !== null &&
        Object.keys(processedStructure).length > 0
      );
    };

    const getDirectoryDisplayName = (): string => {
      const currentDir = getCurrentDirectory();
      if (!currentDir) return "";

      const parts = currentDir.split("/").filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1] : currentDir;
    };

    const EmptyState = () => (
      <div className="flex flex-col items-center justify-center  text-center">
        <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 text-zinc-500" />
        </div>
        <h3 className="text-zinc-300 font-medium mb-2">No Project Open</h3>
        <p className="text-zinc-500 text-sm mb-6 max-w-48">
          Create a new project or open an existing repository to get started.
        </p>
        <div className="w-full space-y-3">
          <Input
            ref={projectName}
            placeholder="Enter project name"
            className="bg-zinc-900/50 border-zinc-700/50 text-zinc-100 text-sm h-10 
                       focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 
                       transition-all duration-200"
          />
          <Button
            onClick={createTemplate}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-700 hover:to-purple-700 text-white text-sm h-10
                       transition-all duration-200 shadow-lg hover:shadow-xl
                       hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Project
          </Button>
        </div>
      </div>
    );

    const LoadingState = () => (
      <div className="flex flex-col items-center justify-center h-48 p-6">
        <div className="relative">
          <Loading />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full animate-pulse"></div>
        </div>
        <div className="mt-4 text-center">
          <h4 className="text-zinc-300 font-medium text-sm">
            Loading Repository
          </h4>
          <p className="text-zinc-500 text-xs mt-1">
            Fetching project structure...
          </p>
        </div>
      </div>
    );

    const ProjectHeader = () => {
      const displayName = getDirectoryDisplayName();
      const fullPath = getCurrentDirectory();

      return (
        <div className="px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-zinc-100 font-semibold text-sm truncate">
                  {displayName || "Project"}
                </h3>
                {fullPath && (
                  <p
                    className="text-zinc-500 text-xs font-mono truncate"
                    title={fullPath}
                  >
                    {fullPath}
                  </p>
                )}
              </div>
            </div>
            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              className="pl-9 h-8 bg-zinc-800/50 border-zinc-700/50 text-zinc-100 text-xs
                         focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50
                         transition-all duration-200"
            />
          </div>
        </div>
      );
    };

    const TabContent = ({
      children,
      className = "",
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div
        className={`flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-zinc-950 to-zinc-900 ${className}`}
      >
        {children}
      </div>
    );

    return (
      <div className="w-80 h-full bg-zinc-950 border-r border-zinc-800/50 shadow-2xl">
        <div className="h-full flex flex-col">
          {activeSidebarTab === SidebarTabs.DOCUMENT && (
            <TabContent>
              <div className="flex-1 overflow-hidden">
                <Document />
              </div>
            </TabContent>
          )}

          {activeSidebarTab === SidebarTabs.GIT && (
            <TabContent>
              <div className="flex-1 overflow-hidden">
                <GitBranch />
              </div>
            </TabContent>
          )}

          {activeSidebarTab === SidebarTabs.EXPLORER && (
            <TabContent>
              {explorerloadingStatus ? (
                <LoadingState />
              ) : (
                <>
                  {hasFileStructure() && <ProjectHeader />}

                  <div className="flex-1 overflow-auto custom-scrollbar">
                    {!hasFileStructure() ? (
                      <EmptyState />
                    ) : (
                      <div className="p-3">
                        <FileTree
                          structure={getProcessedFileStructure()}
                          onSelect={handleFileSelect}
                          searchTerm={searchTerm}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </TabContent>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="h-6 bg-zinc-900/50 border-t border-zinc-800/50 flex items-center px-3">
          <div className="flex items-center space-x-2 text-xs text-zinc-500">
            {activeSidebarTab === SidebarTabs.EXPLORER &&
              hasFileStructure() && (
                <>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Ready</span>
                </>
              )}
          </div>
        </div>
      </div>
    );
  }
);

export default Explorer;
