import React, { useState, useMemo } from "react";
import {
  FaFile,
  FaFolder,
  FaFolderOpen,
  FaCode,
  FaImage,
  FaFileAlt,
  FaCog,
} from "react-icons/fa";
import type { FileStructure } from "../../../../pages/Playground";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FileTreeProps {
  structure: FileStructure | null;
  path?: string;
  onSelect?: (fileName: string, absolutePath: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({
  structure,
  path = "",
  onSelect,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["/", path])
  );

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newExpandedFolders = new Set(prev);
      if (newExpandedFolders.has(folderPath)) {
        newExpandedFolders.delete(folderPath);
      } else {
        newExpandedFolders.add(folderPath);
      }
      return newExpandedFolders;
    });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
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
    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "js":
      case "jsx":
        return "text-yellow-400";
      case "ts":
      case "tsx":
        return "text-blue-400";
      case "vue":
        return "text-green-400";
      case "py":
        return "text-green-500";
      case "java":
        return "text-orange-500";
      case "cpp":
      case "c":
        return "text-blue-500";
      case "cs":
        return "text-purple-500";
      case "php":
        return "text-indigo-400";
      case "rb":
        return "text-red-400";
      case "go":
        return "text-cyan-400";
      case "rs":
        return "text-orange-600";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
      case "webp":
      case "ico":
        return "text-pink-400";
      case "json":
      case "xml":
        return "text-amber-400";
      case "yaml":
      case "yml":
        return "text-red-300";
      case "md":
        return "text-blue-300";
      case "css":
      case "scss":
      case "sass":
        return "text-pink-300";
      case "html":
        return "text-orange-400";
      default:
        return "text-zinc-400";
    }
  };

  const filteredData = useMemo(() => {
    if (!structure || typeof structure !== "object") {
      return { directories: {}, files: {} };
    }

    const directories: Record<string, FileStructure> = {};
    const files: Record<string, string> = {};

    Object.entries(structure).forEach(([key, value]) => {
      if (typeof value === "string") {
        files[key] = value;
      } else if (typeof value === "object" && value !== null) {
        const entries = Object.entries(value);
        const isFileEntry =
          entries.length > 0 &&
          entries.every(([k, v]) => typeof v === "string" && k.startsWith("/"));

        if (isFileEntry) {
          entries.forEach(([absolutePath, fileName]) => {
            if (typeof fileName === "string") {
              files[fileName] = absolutePath;
            }
          });
        } else {
          directories[key] = value as FileStructure;
        }
      }
    });

    return { directories, files };
  }, [structure]);

  if (!structure || typeof structure !== "object") {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-2">
          <FaFolder className="w-4 h-4 text-zinc-400" />
        </div>
        <p className="text-xs font-medium text-zinc-200">No files found</p>
        <p className="text-xs mt-0.5 text-zinc-400">
          This directory appears to be empty
        </p>
      </div>
    );
  }

  const { directories, files } = filteredData;
  const sortedDirectories = Object.keys(directories).sort();
  const sortedFileNames = Object.keys(files).sort();

  return (
    <div className="text-xs space-y-0.5">
      {sortedDirectories.map((dirName) => {
        const dirContent = directories[dirName];
        const currentPath = path ? `${path}/${dirName}` : `/${dirName}`;
        const isExpanded = expandedFolders.has(currentPath);

        return (
          <div key={`dir-${dirName}`} className="select-none">
            <div
              className={cn(
                "flex items-center gap-1.5 cursor-pointer px-1.5 py-1 rounded-md transition-all duration-150",
                "hover:bg-zinc-700 hover:text-zinc-200 border border-transparent hover:border-zinc-600"
              )}
              onClick={() => toggleFolder(currentPath)}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {isExpanded ? (
                  <FaFolderOpen className="flex-shrink-0 w-3 h-3 transition-colors text-blue-400" />
                ) : (
                  <FaFolder className="flex-shrink-0 w-3 h-3 transition-colors text-blue-400" />
                )}
                <span
                  className="truncate text-xs font-medium transition-colors text-zinc-200"
                  title={dirName}
                >
                  {dirName}
                </span>
              </div>
              <div className="w-1 h-1 rounded-full bg-blue-400 opacity-60" />
            </div>

            {isExpanded && (
              <div className="ml-3 mt-0.5 pl-2 space-y-0.5 relative border-l border-zinc-600/30">
                <FileTree
                  structure={dirContent}
                  path={currentPath}
                  onSelect={onSelect}
                />
              </div>
            )}
          </div>
        );
      })}

      {sortedFileNames.map((fileName) => {
        const absolutePath = files[fileName];
        const isEllipsis = fileName.startsWith("...");
        const FileIcon = getFileIcon(fileName);
        const fileColor = getFileColor(fileName);

        return (
          <div
            key={`file-${fileName}`}
            className={cn(
              "flex items-center gap-1.5 px-1.5 py-1 rounded-md transition-all duration-150 border border-transparent",
              isEllipsis
                ? "cursor-default text-zinc-400"
                : "cursor-pointer hover:bg-zinc-700 hover:text-zinc-200 hover:border-zinc-600"
            )}
            onClick={() =>
              !isEllipsis && onSelect && onSelect(fileName, absolutePath)
            }
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <FileIcon
                className={cn(
                  "flex-shrink-0 w-3 h-3 transition-colors",
                  isEllipsis ? "text-zinc-400" : fileColor
                )}
              />
              <span
                className={cn(
                  "truncate text-xs transition-colors",
                  isEllipsis ? "italic text-zinc-400" : "font-medium"
                )}
                title={`${fileName} → ${absolutePath}`}
              >
                {fileName}
              </span>
            </div>
            {!isEllipsis && (
              <div className="w-0.5 h-0.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
          </div>
        );
      })}

      {sortedDirectories.length === 0 && sortedFileNames.length === 0 && (
        <Label className="text-zinc-400">No files or folders to display</Label>
      )}
    </div>
  );
};

export default FileTree;
