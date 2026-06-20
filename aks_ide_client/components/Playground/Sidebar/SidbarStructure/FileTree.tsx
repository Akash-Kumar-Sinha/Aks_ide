import React, { useState } from "react";
import {
  FaFile,
  FaFolder,
  FaFolderOpen,
  FaCode,
  FaImage,
  FaFileAlt,
  FaCog,
  FaSpinner,
} from "react-icons/fa";
import type { TreeNode } from "@/components/Playground/hooks/useFileNavigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileTreeProps {
  treeMap: Map<string, TreeNode[]>;
  currentPath: string;
  fetchPath: (path: string) => void;
  fetchingPaths: Set<string>;
  onSelect?: (fileName: string, absolutePath: string) => void;
  onFolderSelect?: (dirName: string, absolutePath: string) => void;
  selectedAbsolutePath?: string;
  selectedFolderPath?: string;
  depth?: number;
}

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "vue":
    case "py":
    case "java":
    case "cpp":
    case "c":
    case "cs":
    case "php":
    case "rb":
    case "go":
    case "rs":
      return FaCode;
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "webp":
    case "ico":
      return FaImage;
    case "json":
    case "xml":
    case "yaml":
    case "yml":
    case "toml":
    case "config":
      return FaCog;
    case "md":
    case "txt":
    case "doc":
    case "docx":
    case "pdf":
      return FaFileAlt;
    default:
      return FaFile;
  }
};

const getFileColor = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "text-yellow-400/80";
    case "ts":
    case "tsx":
      return "text-blue-400/80";
    case "vue":
      return "text-green-400/80";
    case "py":
      return "text-green-500/80";
    case "java":
      return "text-blue-500/80";
    case "cpp":
    case "c":
      return "text-blue-500/80";
    case "cs":
      return "text-purple-500/80";
    case "php":
      return "text-indigo-400/80";
    case "rb":
      return "text-red-400/80";
    case "go":
      return "text-cyan-400/80";
    case "rs":
      return "text-blue-600/80";
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "svg":
    case "webp":
    case "ico":
      return "text-pink-400/80";
    case "json":
    case "xml":
      return "text-amber-400/80";
    case "yaml":
    case "yml":
      return "text-red-300/80";
    case "md":
      return "text-blue-300/80";
    case "css":
    case "scss":
    case "sass":
      return "text-pink-300/80";
    case "html":
      return "text-blue-400/80";
    default:
      return "text-zinc-500";
  }
};

const FileTree: React.FC<FileTreeProps> = ({
  treeMap,
  currentPath,
  fetchPath,
  fetchingPaths,
  onSelect,
  onFolderSelect,
  selectedAbsolutePath,
  selectedFolderPath,
  depth = 0,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(depth === 0 ? [currentPath] : []),
  );

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
        if (!treeMap.has(folderPath)) {
          fetchPath(folderPath);
        }
      }
      return next;
    });
  };

  const items = treeMap.get(currentPath) ?? [];
  const dirs = items.filter((i) => i.is_dir).sort((a, b) => a.name.localeCompare(b.name));
  const files = items.filter((i) => !i.is_dir).sort((a, b) => a.name.localeCompare(b.name));

  if (items.length === 0 && !fetchingPaths.has(currentPath) && depth === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
          style={{ background: "var(--ide-elevated)" }}
        >
          <FaFolder className="w-3.5 h-3.5 text-zinc-500" />
        </div>
        <p className="text-xs text-zinc-600">No files found</p>
      </div>
    );
  }

  return (
    <div className="text-xs space-y-px">
      {dirs.map((dir) => {
        const isExpanded = expandedFolders.has(dir.path);
        const isFolderSelected = selectedFolderPath === dir.path;
        const isLoading = fetchingPaths.has(dir.path);

        return (
          <div key={`dir-${dir.path}`} className="select-none">
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex items-center gap-1.5 cursor-pointer px-1.5 py-0.5 rounded-sm transition-colors border-l-2",
                    isFolderSelected
                      ? "text-zinc-100 border-blue-500"
                      : "text-zinc-400 border-transparent hover:bg-white/5 hover:text-zinc-200",
                  )}
                  style={
                    isFolderSelected
                      ? { background: "var(--ide-accent)" }
                      : undefined
                  }
                  onClick={() => {
                    toggleFolder(dir.path);
                    onFolderSelect?.(dir.name, dir.path);
                  }}
                >
                  {isLoading ? (
                    <FaSpinner className="shrink-0 w-3 h-3 text-blue-400/60 animate-spin" />
                  ) : isExpanded ? (
                    <FaFolderOpen
                      className={cn(
                        "shrink-0 w-3 h-3",
                        isFolderSelected ? "text-blue-400" : "text-blue-400/60",
                      )}
                    />
                  ) : (
                    <FaFolder
                      className={cn(
                        "shrink-0 w-3 h-3",
                        isFolderSelected ? "text-blue-400" : "text-blue-400/60",
                      )}
                    />
                  )}
                  <span className="truncate flex-1 font-medium">{dir.name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4} className="font-mono text-[11px]">
                {dir.path}
              </TooltipContent>
            </Tooltip>

            {isExpanded && (
              <div className="ml-3 pl-2 border-l border-white/5">
                {treeMap.has(dir.path) ? (
                  <FileTree
                    treeMap={treeMap}
                    currentPath={dir.path}
                    fetchPath={fetchPath}
                    fetchingPaths={fetchingPaths}
                    onSelect={onSelect}
                    onFolderSelect={onFolderSelect}
                    selectedAbsolutePath={selectedAbsolutePath}
                    selectedFolderPath={selectedFolderPath}
                    depth={depth + 1}
                  />
                ) : isLoading ? (
                  <span className="text-zinc-600 text-xs px-1.5 flex items-center gap-1">
                    <FaSpinner className="w-2.5 h-2.5 animate-spin" /> Loading…
                  </span>
                ) : null}
              </div>
            )}
          </div>
        );
      })}

      {files.map((file) => {
        const isActive = file.path === selectedAbsolutePath;
        const FileIcon = getFileIcon(file.name);
        const fileColor = getFileColor(file.name);

        return (
          <Tooltip key={`file-${file.path}`}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex items-center gap-1.5 px-1.5 py-0.5 rounded-sm transition-colors border-l-2 cursor-pointer",
                  isActive
                    ? "text-zinc-100 border-blue-500"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border-transparent",
                )}
                style={isActive ? { background: "var(--ide-accent)" } : undefined}
                onClick={() => onSelect?.(file.name, file.path)}
              >
                <FileIcon
                  className={cn(
                    "shrink-0 w-3 h-3",
                    isActive ? "text-blue-400" : fileColor,
                  )}
                />
                <span className={cn("truncate", isActive ? "font-medium" : "font-normal")}>
                  {file.name}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4} className="font-mono text-[11px]">
              {file.path}
            </TooltipContent>
          </Tooltip>
        );
      })}

      {dirs.length === 0 && files.length === 0 && !fetchingPaths.has(currentPath) && (
        <span className="text-zinc-700 text-xs px-1.5">Empty directory</span>
      )}
    </div>
  );
};

export default FileTree;
