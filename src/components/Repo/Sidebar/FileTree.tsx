import React, { useState } from "react";
import { FaFile, FaFolder, FaFolderOpen } from "react-icons/fa";

interface FileTreeProps {
  tree: Record<string, unknown | null> | null;
  path?: string;
  onSelect?: (path: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ tree, path = "", onSelect }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
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

  return (
    <div className="text-xs">
      {tree && (
        <>
          {Object.entries(tree)
            .filter(([, value]) => value !== null && typeof value === "object")
            .map(([name, value]) => {
              const currentPath = path ? `${path}/${name}` : `/${name}`;
              const isExpanded = expandedFolders.has(currentPath);

              return (
                <div key={name}>
                  <div
                    className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800 p-1 rounded"
                    onClick={() => toggleFolder(currentPath)}
                  >
                    {isExpanded ? (
                      <FaFolderOpen className="text-yellow-400" />
                    ) : (
                      <FaFolder className="text-yellow-400" />
                    )}
                    <span className="text-white overflow-hidden">{name}</span>
                  </div>

                  {isExpanded && (
                    <div className="ml-4">
                      <FileTree
                        tree={value as Record<string, unknown>}
                        path={currentPath}
                        onSelect={onSelect}
                      />
                    </div>
                  )}
                </div>
              );
            })}

          {Object.entries(tree)
            .filter(([, value]) => value === null || typeof value !== "object")
            .map(([name]) => {
              const currentPath = path ? `${path}/${name}` : `/${name}`;
              return (
                <div
                  key={name}
                  className="flex items-center gap-2 cursor-pointer hover:bg-zinc-700 p-1 rounded pl-4"
                  onClick={() => onSelect && onSelect(currentPath)}
                >
                  <FaFile className="text-blue-300" />
                  <span className="text-zinc-300">{name}</span>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
};

export default FileTree;
