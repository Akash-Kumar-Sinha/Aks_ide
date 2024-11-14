import React, { useState } from "react";
import { FaFile, FaFolder, FaFolderOpen } from "react-icons/fa";

interface FileTreeProps {
  tree: Record<string, unknown | null> | null | undefined;
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
    <div className="w-full border-l border-gray-500">
      {tree && (
        <div>
          {Object.entries(tree)
            .filter(([, value]) => value !== null && typeof value === "object")
            .map(([name, value]) => {
              const currentPath = path ? `${path}/${name}` : `/${name}`;
              const isExpanded = expandedFolders.has(currentPath);

              return (
                <div key={name}>
                  <div
                    className="flex items-center hover:bg-zinc-800 cursor-pointer"
                    onClick={() => toggleFolder(currentPath)}
                  >
                    {isExpanded ? (
                      <FaFolderOpen className="mr-2 text-yellow-300" />
                    ) : (
                      <FaFolder className="mr-2 text-yellow-300" />
                    )}
                    <div className="text-zinc-50 font-normal">{name}</div>
                  </div>
                  {isExpanded && (
                    <div className="ml-4 text-xs">
                      <FileTree
                        tree={value as Record<string, unknown | null>}
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
                  className="text-gray-400 cursor-pointer flex items-center hover:bg-zinc-700"
                  onClick={() => {
                    if (onSelect) {
                      onSelect(currentPath);
                    }
                  }}
                >
                  <FaFile className="mr-2 text-blue-400" />
                  {name}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default FileTree;
