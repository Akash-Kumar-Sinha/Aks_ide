"use client";

import React, { useCallback, useState } from "react";
import FileTree from "./FileTree";
import { RefreshCw, FolderUp, FolderOpen, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TreeNode } from "@/components/Playground/hooks/useFileNavigation";

interface ExplorerProps {
  treeMap: Map<string, TreeNode[]>;
  fetchingPaths: Set<string>;
  explorerLoadingStatus: boolean;
  fetchPath: (path: string) => void;
  onRefresh?: () => void;
  selectedAbsolutePath?: string;
  onFileSelect?: (name: string, absolutePath: string) => void;
  setSelectedFileAbsolutePath?: (absolutePath: string) => void;
  handleSelect?: (path: string) => void;
}

const Explorer: React.FC<ExplorerProps> = React.memo(
  ({
    treeMap,
    fetchingPaths,
    explorerLoadingStatus,
    fetchPath,
    onRefresh,
    selectedAbsolutePath,
    onFileSelect,
    setSelectedFileAbsolutePath,
    handleSelect,
  }) => {
    const [rootPath, setRootPath] = useState("/");
    const [selectedFolderPath, setSelectedFolderPath] = useState<string | null>(
      null,
    );
    const [pathEditMode, setPathEditMode] = useState(false);
    const [pathDraft, setPathDraft] = useState("");

    const navigateTo = useCallback(
      (path: string) => {
        setRootPath(path);
        setSelectedFolderPath(null);
        if (!treeMap.has(path)) {
          fetchPath(path);
        }
      },
      [treeMap, fetchPath],
    );

    const handleFileSelect = (fileName: string, absolutePath: string) => {
      setSelectedFolderPath(null);
      if (onFileSelect) {
        onFileSelect(fileName, absolutePath);
      } else {
        setSelectedFileAbsolutePath?.(absolutePath);
        handleSelect?.(fileName);
      }
    };

    const handleFolderSelect = (_dirName: string, absolutePath: string) => {
      setSelectedFolderPath((prev) =>
        prev === absolutePath ? null : absolutePath,
      );
    };

    const handleOpenSelected = () => {
      if (!selectedFolderPath) return;
      navigateTo(selectedFolderPath);
    };

    const handleGoUp = () => {
      if (!rootPath || rootPath === "/") return;
      const parent = rootPath.replace(/\/[^/]+$/, "") || "/";
      navigateTo(parent);
    };

    const handlePathNavigate = () => {
      const path = pathDraft.trim() || "/";
      navigateTo(path);
      setPathEditMode(false);
      setPathDraft("");
    };

    const displayName =
      rootPath === "/"
        ? "/"
        : (rootPath.split("/").filter(Boolean).pop() ?? "/");
    const canGoUp = rootPath !== "/";
    const hasRoot = treeMap.has(rootPath);

    return (
      <div
        className="flex flex-col h-full"
        style={{ background: "var(--ide-surface)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-2 px-3 h-9 shrink-0 border-b"
          style={{
            background: "var(--ide-panel)",
            borderColor: "var(--ide-border)",
          }}
        >
          {pathEditMode ? (
            <div className="flex items-center gap-1.5 flex-1">
              <Input
                autoFocus
                value={pathDraft}
                onChange={(e) => setPathDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handlePathNavigate();
                  if (e.key === "Escape") {
                    setPathEditMode(false);
                    setPathDraft("");
                  }
                }}
                placeholder={rootPath}
                className="h-6 text-xs font-mono px-2 bg-transparent border-zinc-700 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500/50"
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-6 shrink-0"
                onClick={handlePathNavigate}
              >
                <ChevronRight className="size-3" />
              </Button>
            </div>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center gap-1 min-w-0 flex-1 text-left group"
                    onClick={() => {
                      setPathDraft(rootPath);
                      setPathEditMode(true);
                    }}
                  >
                    <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase shrink-0">
                      Explorer
                    </span>
                    <span className="text-zinc-700 text-[10px] mx-0.5">/</span>
                    <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors truncate font-mono">
                      {displayName}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {rootPath} - click to type a path
                </TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-0.5 shrink-0">
                {canGoUp && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-zinc-600 hover:text-zinc-300"
                        onClick={handleGoUp}
                      >
                        <FolderUp className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Go to parent</TooltipContent>
                  </Tooltip>
                )}

                {selectedFolderPath && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-blue-400 hover:text-blue-300"
                        onClick={handleOpenSelected}
                      >
                        <FolderOpen className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      Open &quot;{selectedFolderPath.split("/").pop()}&quot; as
                      root
                    </TooltipContent>
                  </Tooltip>
                )}

                {onRefresh && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-6 text-zinc-600 hover:text-zinc-300"
                        disabled={explorerLoadingStatus}
                        onClick={onRefresh}
                      >
                        <RefreshCw
                          className={`size-3.5 ${explorerLoadingStatus ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Refresh</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </>
          )}
        </div>

        {/* Tree */}
        <ScrollArea className="flex-1">
          {explorerLoadingStatus && !hasRoot ? (
            <div className="flex flex-col gap-2 p-3">
              <Skeleton
                className="h-4 w-3/4"
                style={{ background: "var(--ide-elevated)" }}
              />
              <Skeleton
                className="h-4 w-1/2"
                style={{ background: "var(--ide-elevated)" }}
              />
              <Skeleton
                className="h-4 w-2/3"
                style={{ background: "var(--ide-elevated)" }}
              />
              <Skeleton
                className="h-4 w-3/5"
                style={{ background: "var(--ide-elevated)" }}
              />
            </div>
          ) : !hasRoot ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                Connecting…
              </span>
            </div>
          ) : (
            <div className="p-2">
              <FileTree
                treeMap={treeMap}
                currentPath={rootPath}
                fetchPath={fetchPath}
                fetchingPaths={fetchingPaths}
                onSelect={handleFileSelect}
                onFolderSelect={handleFolderSelect}
                selectedAbsolutePath={selectedAbsolutePath}
                selectedFolderPath={selectedFolderPath ?? undefined}
              />
            </div>
          )}
        </ScrollArea>
      </div>
    );
  },
);

Explorer.displayName = "Explorer";
export default Explorer;
