import React, { useState, useMemo } from "react";
import { FaFile, FaFolder, FaFolderOpen, FaCode, FaImage, FaFileAlt, FaCog } from "react-icons/fa";

// Type definitions for the new flat structure
interface FileStructure {
  [key: string]: FileStructure | string[] | undefined;
  _files?: string[];
}

interface FileTreeProps {
  structure: FileStructure | null;
  path?: string;
  onSelect?: (path: string, isFile: boolean) => void;
  searchTerm?: string;
}

const FileTree: React.FC<FileTreeProps> = ({ 
  structure, 
  path = "", 
  onSelect,
  searchTerm = ""
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(["/", path]) // Auto-expand root and current path
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

  // Get appropriate icon for file type
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
      case 'vue':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'cs':
      case 'php':
      case 'rb':
      case 'go':
      case 'rs':
        return FaCode;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
      case 'ico':
        return FaImage;
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
      case 'toml':
      case 'config':
        return FaCog;
      case 'md':
      case 'txt':
      case 'doc':
      case 'docx':
      case 'pdf':
        return FaFileAlt;
      default:
        return FaFile;
    }
  };

  // Get color for file type
  const getFileColor = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'text-yellow-400';
      case 'ts':
      case 'tsx':
        return 'text-blue-400';
      case 'vue':
        return 'text-green-400';
      case 'py':
        return 'text-green-500';
      case 'java':
        return 'text-orange-500';
      case 'cpp':
      case 'c':
        return 'text-blue-500';
      case 'cs':
        return 'text-purple-500';
      case 'php':
        return 'text-indigo-400';
      case 'rb':
        return 'text-red-400';
      case 'go':
        return 'text-cyan-400';
      case 'rs':
        return 'text-orange-600';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
      case 'webp':
      case 'ico':
        return 'text-pink-400';
      case 'json':
      case 'xml':
        return 'text-amber-400';
      case 'yaml':
      case 'yml':
        return 'text-red-300';
      case 'md':
        return 'text-blue-300';
      case 'css':
      case 'scss':
      case 'sass':
        return 'text-pink-300';
      case 'html':
        return 'text-orange-400';
      default:
        return 'text-zinc-400';
    }
  };

  // Filter items based on search term
  const filteredData = useMemo(() => {
    if (!structure || typeof structure !== 'object') {
      return { directories: {}, files: [] };
    }

    const directories: Record<string, FileStructure> = {};
    const files: string[] = [];

    Object.entries(structure).forEach(([key, value]) => {
      if (key === '_files' && Array.isArray(value)) {
        const filteredFiles = value.filter(fileName =>
          !searchTerm || fileName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        files.push(...filteredFiles);
      } else if (typeof value === 'object' && value !== null) {
        if (!searchTerm || key.toLowerCase().includes(searchTerm.toLowerCase())) {
          directories[key] = value as FileStructure;
        }
      }
    });

    return { directories, files: [...new Set(files)] };
  }, [structure, searchTerm]);

  if (!structure || typeof structure !== 'object') {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center mb-3">
          <FaFolder className="text-zinc-500 w-6 h-6" />
        </div>
        <p className="text-zinc-500 text-sm font-medium">No files found</p>
        <p className="text-zinc-600 text-xs mt-1">This directory appears to be empty</p>
      </div>
    );
  }

  const { directories, files } = filteredData;
  const sortedDirectories = Object.keys(directories).sort();
  const sortedFiles = files.sort();

  return (
    <div className="text-sm space-y-0.5">
      {/* Render Directories First */}
      {sortedDirectories.map((dirName) => {
        const dirContent = directories[dirName];
        const currentPath = path ? `${path}/${dirName}` : `/${dirName}`;
        const isExpanded = expandedFolders.has(currentPath);

        return (
          <div key={`dir-${dirName}`} className="select-none">
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800/40 active:bg-zinc-800/60 
                         px-2 py-1.5 rounded-lg transition-all duration-150 group border border-transparent
                         hover:border-zinc-700/30"
              onClick={() => toggleFolder(currentPath)}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isExpanded ? (
                  <FaFolderOpen className="text-blue-400 flex-shrink-0 w-3.5 h-3.5 
                                         group-hover:text-blue-300 transition-colors" />
                ) : (
                  <FaFolder className="text-blue-400 flex-shrink-0 w-3.5 h-3.5 
                                     group-hover:text-blue-300 transition-colors" />
                )}
                <span className="text-zinc-200 truncate font-medium group-hover:text-zinc-50 
                               transition-colors" title={dirName}>
                  {dirName}
                </span>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                isExpanded ? 'bg-blue-400 opacity-100' : 'bg-zinc-600 opacity-0 group-hover:opacity-100'
              }`} />
            </div>

            {isExpanded && (
              <div className="ml-4 mt-1 border-l-2 border-zinc-800/50 pl-3 space-y-0.5 
                             relative before:absolute before:left-0 before:top-0 before:bottom-0 
                             before:w-0.5 before:bg-gradient-to-b before:from-blue-500/20 
                             before:to-transparent">
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

      {/* Render Files After Directories */}
      {sortedFiles.map((fileName, index) => {
        const currentPath = path ? `${path}/${fileName}` : `/${fileName}`;
        const isEllipsis = fileName.startsWith("...");
        const FileIcon = getFileIcon(fileName);
        const fileColor = getFileColor(fileName);
        
        return (
          <div
            key={`file-${index}-${fileName}`}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 
                       group border border-transparent ${
              isEllipsis 
                ? "text-zinc-500 cursor-default" 
                : "cursor-pointer hover:bg-zinc-800/40 active:bg-zinc-800/60 hover:border-zinc-700/30"
            }`}
            onClick={() => !isEllipsis && onSelect && onSelect(currentPath, true)}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileIcon className={`flex-shrink-0 w-3.5 h-3.5 transition-colors ${
                isEllipsis 
                  ? "text-zinc-600" 
                  : `${fileColor} group-hover:brightness-110`
              }`} />
              <span className={`truncate transition-colors ${
                isEllipsis 
                  ? "text-zinc-500 italic text-xs" 
                  : "text-zinc-300 group-hover:text-zinc-100 font-medium"
              }`} title={fileName}>
                {fileName}
              </span>
            </div>
            {!isEllipsis && (
              <div className="w-1 h-1 rounded-full bg-zinc-600 opacity-0 group-hover:opacity-100 
                             transition-opacity duration-200" />
            )}
          </div>
        );
      })}

      {/* Enhanced Empty State */}
      {sortedDirectories.length === 0 && sortedFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center 
                       bg-zinc-900/30 rounded-xl border border-zinc-800/50 mt-2">
          <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center mb-2">
            <FaFolder className="text-zinc-600 w-5 h-5" />
          </div>
          <p className="text-zinc-500 text-sm font-medium">Directory is empty</p>
          <p className="text-zinc-600 text-xs mt-0.5">No files or folders to display</p>
        </div>
      )}

      {/* Search Results Empty State */}
      {searchTerm && sortedDirectories.length === 0 && sortedFiles.length === 0 && structure && Object.keys(structure).length > 0 && (
        <div className="flex flex-col items-center justify-center py-6 px-4 text-center 
                       bg-amber-900/10 rounded-xl border border-amber-800/30 mt-2">
          <div className="w-10 h-10 rounded-lg bg-amber-800/20 flex items-center justify-center mb-2">
            <FaFile className="text-amber-500 w-5 h-5" />
          </div>
          <p className="text-amber-400 text-sm font-medium">No matches found</p>
          <p className="text-amber-500/70 text-xs mt-0.5">
            Try adjusting your search term: "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};

export default FileTree;