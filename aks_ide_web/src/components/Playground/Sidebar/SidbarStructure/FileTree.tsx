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
import useTheme from "../../../ui/lib/useTheme";
import { Label } from "../../../ui/Label/Label";

interface FileTreeProps {
  structure: FileStructure | null;
  path?: string;
  onSelect?: (fileName: string, absolutePath: string) => void;
  searchTerm?: string;
}

const FileTree: React.FC<FileTreeProps> = ({
  structure,
  path = "",
  onSelect,
  searchTerm = "",
}) => {
  const { theme } = useTheme();
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
        if (
          !searchTerm ||
          key.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          files[key] = value;
        }
      } else if (typeof value === "object" && value !== null) {
        const entries = Object.entries(value);
        const isFileEntry =
          entries.length > 0 &&
          entries.every(([k, v]) => typeof v === "string" && k.startsWith("/"));

        if (isFileEntry) {
          entries.forEach(([absolutePath, fileName]) => {
            if (typeof fileName === "string") {
              if (
                !searchTerm ||
                fileName.toLowerCase().includes(searchTerm.toLowerCase())
              ) {
                files[fileName] = absolutePath;
              }
            }
          });
        } else {
          if (
            !searchTerm ||
            key.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            directories[key] = value as FileStructure;
          }
        }
      }
    });

    return { directories, files };
  }, [structure, searchTerm]);

  if (!structure || typeof structure !== "object") {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-3 text-center">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
          style={{ backgroundColor: theme.secondaryColor }}
        >
          <FaFolder className="w-4 h-4" style={{ color: theme.textDimmed }} />
        </div>
        <p className="text-xs font-medium" style={{ color: theme.textDimmed }}>
          No files found
        </p>
        <p className="text-xs mt-0.5" style={{ color: theme.textDimmed }}>
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
              className="flex items-center gap-1.5 cursor-pointer px-1.5 py-1 rounded-md transition-all duration-150 group border border-transparent"
              onClick={() => toggleFolder(currentPath)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.accentColor;
                e.currentTarget.style.borderColor = theme.accentColor + "50";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {isExpanded ? (
                  <FaFolderOpen
                    className="flex-shrink-0 w-3 h-3 transition-colors"
                    style={{ color: theme.primaryColor }}
                  />
                ) : (
                  <FaFolder
                    className="flex-shrink-0 w-3 h-3 transition-colors"
                    style={{ color: theme.primaryColor }}
                  />
                )}
                <span
                  className="truncate text-xs font-medium transition-colors"
                  style={{ color: theme.textColor }}
                  title={dirName}
                >
                  {dirName}
                </span>
              </div>
              <div
                className="w-1 h-1 rounded-full transition-all duration-200"
                style={{
                  backgroundColor: isExpanded
                    ? theme.primaryColor
                    : theme.textDimmed,
                  opacity: isExpanded ? 1 : 0,
                }}
              />
            </div>

            {isExpanded && (
              <div
                className="ml-3 mt-0.5 pl-2 space-y-0.5 relative"
                style={{
                  borderLeft: `1px solid ${theme.secondaryColor}`,
                }}
              >
                <FileTree
                  structure={dirContent}
                  path={currentPath}
                  onSelect={onSelect}
                  searchTerm={searchTerm}
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
            className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md transition-all duration-150 
                       group border border-transparent ${
                         isEllipsis ? "cursor-default" : "cursor-pointer"
                       }`}
            style={{
              color: isEllipsis ? theme.textDimmed : theme.textColor,
            }}
            onClick={() =>
              !isEllipsis && onSelect && onSelect(fileName, absolutePath)
            }
            onMouseEnter={(e) => {
              if (!isEllipsis) {
                e.currentTarget.style.backgroundColor = theme.textDimmed + "20";
                e.currentTarget.style.borderColor = theme.textDimmed + "30";
              }
            }}
            onMouseLeave={(e) => {
              if (!isEllipsis) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }
            }}
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <FileIcon
                className="flex-shrink-0 w-3 h-3 transition-colors"
                style={{ color: isEllipsis ? theme.textDimmed : fileColor }}
              />
              <span
                className={`truncate text-xs transition-colors ${
                  isEllipsis ? "italic" : "font-medium"
                }`}
                style={{
                  color: isEllipsis ? theme.textDimmed : theme.textColor,
                }}
                title={`${fileName} → ${absolutePath}`}
              >
                {fileName}
              </span>
            </div>
            {!isEllipsis && (
              <div
                className="w-0.5 h-0.5 rounded-full transition-opacity duration-200 opacity-0 group-hover:opacity-100"
                style={{ backgroundColor: theme.textDimmed }}
              />
            )}
          </div>
        );
      })}

      {sortedDirectories.length === 0 && sortedFileNames.length === 0 && (
        <Label dimmed scale="sm">
          No files or folders to display
        </Label>
      )}

      {searchTerm &&
        sortedDirectories.length === 0 &&
        sortedFileNames.length === 0 &&
        structure &&
        Object.keys(structure).length > 0 && (
          <div
            className="flex flex-col items-center justify-center py-4 px-3 text-center 
                       rounded-lg border mt-1"
            style={{
              backgroundColor: theme.warningColor + "20",
              borderColor: theme.warningColor + "50",
            }}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center mb-1.5"
              style={{ backgroundColor: theme.warningColor + "30" }}
            >
              <FaFile
                className="w-3.5 h-3.5"
                style={{ color: theme.warningColor }}
              />
            </div>
            <p
              className="text-xs font-medium"
              style={{ color: theme.warningColor }}
            >
              No matches found
            </p>
            <p className="text-xs mt-0.5" style={{ color: theme.textDimmed }}>
              Try adjusting your search term: "{searchTerm}"
            </p>
          </div>
        )}
    </div>
  );
};

export default FileTree;
