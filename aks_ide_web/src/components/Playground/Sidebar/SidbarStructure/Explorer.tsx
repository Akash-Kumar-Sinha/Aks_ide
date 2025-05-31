import React, { useCallback, useEffect } from "react";
import FileTree from "./FileTree";
import { Button } from "../../../ui/Button/Button";
import { Input } from "../../../ui/Input/Input";
import { FolderOpen, Plus, Search, RefreshCw } from "lucide-react";
import { Loading } from "../../../ui/Loading/Loading";
import { Label } from "../../../ui/Label/Label";
import type { FileStructure } from "../../../../pages/Playground";

interface RepoStructureResponse {
  current_directory?: string;
  structure?: FileStructure;
}

interface ExplorerProps {
  fileStructure: Record<string, unknown>;
  createTemplate: () => void;
  projectName?: React.RefObject<HTMLInputElement>;
  explorerloadingStatus: boolean;
  handleSelect: (path: string) => void;
  setSelectedFileAbsolutePath: (absolutePath: string) => void;
  onRefresh?: () => void;
}

const Explorer: React.FC<ExplorerProps> = React.memo(
  ({
    fileStructure = {},
    createTemplate,
    projectName,
    explorerloadingStatus,
    setSelectedFileAbsolutePath,
    handleSelect,
    onRefresh,
  }) => {
    const [searchTerm, setSearchTerm] = React.useState("");
    console.log(
      "Explorer component rendered with fileStructure:",
      fileStructure
    );

    const getProcessedFileStructure = useCallback((): FileStructure | null => {
      try {
        const repoResponse = fileStructure as RepoStructureResponse;

        if (
          repoResponse.current_directory &&
          typeof repoResponse.current_directory === "string" &&
          repoResponse.structure &&
          typeof repoResponse.structure === "object"
        ) {
          return repoResponse.structure;
        }

        if (typeof fileStructure === "object" && fileStructure !== null) {
          const keys = Object.keys(fileStructure);
          const hasValidStructure = keys.some(
            (key) =>
              // Check for file entries (string values) or directory entries (object values)
              typeof fileStructure[key] === "string" ||
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
    }, [fileStructure]);

    const handleFileSelect = (fileName: string, absolutePath: string) => {
      // Use the absolute path for selection
      setSelectedFileAbsolutePath(absolutePath);
      handleSelect(fileName);
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

    const hasFileStructure = useCallback((): boolean => {
      const processedStructure = getProcessedFileStructure();
      return (
        processedStructure !== null &&
        Object.keys(processedStructure).length > 0
      );
    }, [getProcessedFileStructure]);

    useEffect(() => {
      hasFileStructure();
    }, [hasFileStructure]);

    const getDirectoryDisplayName = (): string => {
      const currentDir = getCurrentDirectory();
      if (!currentDir) return "";

      const parts = currentDir.split("/").filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1] : currentDir;
    };

    const EmptyState = () => (
      <div className="flex flex-col items-center justify-center text-center gap-6 p-6 h-full">
        <div className="w-16 h-16  rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8 " />
        </div>
        <Label scale="xl">No Project Open</Label>
        <Label dimmed>
          Create a new project or open an existing repository to get started.
        </Label>
        <div className="w-full max-w-xs space-y-3">
          <Input
            ref={projectName}
            placeholder="Enter project name"
            className="bg-zinc-900/50 border-zinc-700/50  text-sm h-10 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
          />
          <Button
            onClick={createTemplate}
            Icon={Plus}
            iconPosition="left"
            disabled={explorerloadingStatus}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm h-10 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {explorerloadingStatus ? (
              <>
                <Loading
                  className="w-4 h-4 mr-2"
                  pattern="dots"
                  loadingMessage="Creating..."
                />
              </>
            ) : (
              <>Create New Project</>
            )}
          </Button>
        </div>
      </div>
    );

    const LoadingState = () => (
      <div className="flex flex-col items-center justify-center text-center p-6 h-full">
        <Loading
          variant="default"
          pattern="dots"
          loadingMessage="Please wait while we load your project structure"
        />
      </div>
    );

    const ProjectHeader = () => {
      const displayName = getDirectoryDisplayName();
      const fullPath = getCurrentDirectory();

      return (
        <div className="px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className=" font-semibold text-sm truncate">
                  {displayName || "Project"}
                </h3>
                {fullPath && (
                  <p
                    className=" text-xs font-mono truncate mt-0.5"
                    title={fullPath}
                  >
                    {fullPath}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {explorerloadingStatus && (
                <Loading className="w-4 h-4 text-blue-400" />
              )}
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  scale="sm"
                  disabled={explorerloadingStatus}
                  className="h-7 w-7 p-0  hover: hover: disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 " />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              disabled={explorerloadingStatus}
              className="pl-9 h-8  border-zinc-700/50  text-xs focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 disabled:opacity-50"
            />
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full">
        {hasFileStructure() && <ProjectHeader />}

        <div className="flex-1 overflow-auto custom-scrollbar">
          {explorerloadingStatus && !hasFileStructure() ? (
            <LoadingState />
          ) : !hasFileStructure() ? (
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
      </div>
    );
  }
);

export default Explorer;
