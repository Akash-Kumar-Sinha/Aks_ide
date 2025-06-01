import React, { useCallback, useEffect, useState } from "react";
import FileTree from "./FileTree";
import { Button } from "../../../ui/Button/Button";
import { Input } from "../../../ui/Input/Input";
import { FolderOpen, Plus, Search, RefreshCw } from "lucide-react";
import { Loading } from "../../../ui/Loading/Loading";
import { Label } from "../../../ui/Label/Label";
import type { FileStructure } from "../../../../pages/Playground";
import useUserProfile from "../../../../utils/useUserProfile";
import useTheme from "../../../ui/lib/useTheme";

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
    const { userProfile } = useUserProfile();
    const [searchTerm, setSearchTerm] = useState("");
    const { theme } = useTheme();

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
      <div className="flex flex-col items-center justify-center text-center gap-6 h-full">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <FolderOpen className="w-8 h-8" style={{ color: theme.textDimmed }} />
        </div>
        <Label scale="xl">No Project Open</Label>
        <Label dimmed>
          Create a new project or open an existing repository to get started.
        </Label>
        <div className="w-full max-w-xs space-y-3">
          <Input
            ref={projectName}
            disabled={!userProfile}
            placeholder="Enter project name"
          />
          <Button
            onClick={createTemplate}
            Icon={Plus}
            iconPosition="left"
            disabled={explorerloadingStatus || !userProfile}
            className="w-full text-sm h-10 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              background: theme.primaryGradient,
              color: theme.textColor,
            }}
          >
            {explorerloadingStatus ? (
              <>
                <Loading
                  className="w-4 h-4 mr-2"
                  pattern="wave"
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
          pattern="wave"
          loadingMessage="Please wait while we load your project structure"
        />
      </div>
    );

    const ProjectHeader = () => {
      const displayName = getDirectoryDisplayName();
      const fullPath = getCurrentDirectory();

      return (
        <div
          className="px-4 py-3 border-b"
          style={{
            borderColor: theme.secondaryColor,
            background: `linear-gradient(to right, ${theme.backgroundColor}80, ${theme.secondaryColor}30)`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <FolderOpen
                className="w-4 h-4 flex-shrink-0"
                style={{ color: theme.primaryColor }}
              />
              <div className="min-w-0 flex-1">
                <h3
                  className="font-semibold text-sm truncate"
                  style={{ color: theme.textColor }}
                >
                  {displayName || "Project"}
                </h3>
                {fullPath && (
                  <p
                    className="text-xs font-mono truncate mt-0.5"
                    title={fullPath}
                    style={{ color: theme.textDimmed }}
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
                  scale="sm"
                  disabled={explorerloadingStatus}
                  className="h-7 w-7 p-0 disabled:opacity-50"
                  style={
                    {
                      backgroundColor: "transparent",
                      color: theme.textColor,
                      "--hover-bg": theme.secondaryColor,
                    } as React.CSSProperties & { [key: string]: string }
                  }
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <Input
              Icon={Search}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              variant="minimal"
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
