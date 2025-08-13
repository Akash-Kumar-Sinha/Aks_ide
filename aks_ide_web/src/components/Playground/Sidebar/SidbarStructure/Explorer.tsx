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
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-[var(--color-card)]">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center mb-4 shadow-lg">
          <FolderOpen className="w-8 h-8 text-[var(--color-primary-foreground)]" />
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
          No Repository Loaded
        </h3>
        <p className="text-[var(--color-muted-foreground)] text-sm mb-6 max-w-sm">
          Create a new project or load an existing repository to start exploring
          your files.
        </p>

        <div className="w-full max-w-xs space-y-3">
          <div className="flex items-center gap-2">
            <Input
              ref={projectName}
              placeholder="Project name"
              className="flex-1 bg-[var(--color-input)] border-[var(--color-border)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:ring-0"
            />
            <Button
              onClick={createTemplate}
              disabled={explorerloadingStatus}
              className="px-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)] disabled:opacity-50"
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
      <div className="flex flex-col items-center justify-center text-center p-6 h-full bg-[var(--color-card)]">
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
        <div className="px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-card)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <FolderOpen className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate text-[var(--color-foreground)]">
                  {displayName || "Project"}
                </h3>
                {fullPath && (
                  <p
                    className="text-xs font-mono truncate mt-0.5 text-[var(--color-muted-foreground)]"
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
                  className="h-7 w-7 p-0 disabled:opacity-50 bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-primary)]/20"
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
      <div className="flex flex-col h-full bg-[var(--color-card)]">
        {hasFileStructure() && <ProjectHeader />}

        <div className="flex-1 overflow-auto custom-scrollbar bg-[var(--color-card)]">
          {explorerloadingStatus && !hasFileStructure() ? (
            <LoadingState />
          ) : !hasFileStructure() ? (
            <EmptyState />
          ) : (
            <div className="p-3 bg-[var(--color-card)]">
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
