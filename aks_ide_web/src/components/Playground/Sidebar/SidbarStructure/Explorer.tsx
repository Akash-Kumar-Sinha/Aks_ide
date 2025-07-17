import React, { useCallback, useEffect } from "react";
import FileTree from "./FileTree";
import { FolderOpen, Plus, RefreshCw } from "lucide-react";
import { Loading } from "../../../ui/Loading/Loading";
import type { FileStructure } from "../../../../pages/Playground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-[#000000]">
        <div className="w-16 h-16 rounded-2xl bg-[#569cd6] flex items-center justify-center mb-4 shadow-lg">
          <FolderOpen className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-[#cccccc] mb-2">
          No Repository Loaded
        </h3>
        <p className="text-[#808080] text-sm mb-6 max-w-sm">
          Create a new project or load an existing repository to start exploring
          your files.
        </p>

        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center gap-2">
            <Input
              ref={projectName}
              placeholder="Project name"
              className="flex-1 bg-[#333333] border-[#333333] text-[#cccccc] placeholder-[#808080] focus:border-[#569cd6] focus:ring-0"
            />
            <Button
              onClick={createTemplate}
              disabled={explorerloadingStatus}
              className="px-4 bg-[#569cd6] hover:bg-[#4a8bc2] text-white disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {explorerloadingStatus && (
            <Loading
              variant="minimal"
              scale="sm"
              pattern="pulse"
              loadingMessage="Creating project..."
            />
          )}
        </div>
      </div>
    );
    const LoadingState = () => (
      <div className="flex flex-col items-center justify-center text-center p-6 h-full bg-[#000000]">
        <Loading
          variant="default"
          pattern="wave"
          loadingMessage="Please wait while we load your project structure"
        />
      </div>
    );

    const ProjectHeader = () => {
      const displayName = getDirectoryDisplayName();
      const fullPath = getCurrentDirectory();

      return (
        <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#000000]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <FolderOpen className="w-4 h-4 flex-shrink-0 text-[#569cd6]" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate text-[#cccccc]">
                  {displayName || "Project"}
                </h3>
                {fullPath && (
                  <p
                    className="text-xs font-mono truncate mt-0.5 text-[#808080]"
                    title={fullPath}
                  >
                    {fullPath}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {explorerloadingStatus && (
                <Loading pattern="wave" className="w-4 h-4" />
              )}
              {onRefresh && (
                <Button
                  onClick={onRefresh}
                  disabled={explorerloadingStatus}
                  className="h-7 w-7 p-0 disabled:opacity-50 bg-transparent text-[#cccccc] hover:bg-[#569cd6]/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col h-full bg-[#000000]">
        {hasFileStructure() && <ProjectHeader />}

        <div className="flex-1 overflow-auto custom-scrollbar bg-[#000000]">
          {explorerloadingStatus && !hasFileStructure() ? (
            <LoadingState />
          ) : !hasFileStructure() ? (
            <EmptyState />
          ) : (
            <div className="p-3 bg-[#000000]">
              <FileTree
                structure={getProcessedFileStructure()}
                onSelect={handleFileSelect}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default Explorer;
