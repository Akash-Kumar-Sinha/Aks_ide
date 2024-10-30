import React from "react";
import { FaFile, FaFolder } from "react-icons/fa";

interface FileTreeProps {
  tree: Record<string, unknown | null>;
  path?: string;
  onSelect?: (path: string) => void;
}

const FileTree: React.FC<FileTreeProps> = ({ tree, path = "", onSelect }) => {
  return (
    <div className="w-96">
      {Object.entries(tree).map(([name, value]) => {
        const currentPath = path ? `${path}/${name}` : name;

        if (value !== null && typeof value === "object") {
          return (
            <div key={name}>
              <div className="flex items-center">
                <FaFolder className="mr-2 text-yellow-300" />
                <div className="text-zinc-50 font-normal cursor-default">
                  {name}
                </div>
              </div>
              <div className="ml-4">
                <FileTree
                  tree={value as Record<string, unknown | null>}
                  path={currentPath}
                  onSelect={onSelect}
                />
              </div>
            </div>
          );
        } else {
          return (
            <div
              key={name}
              className="text-gray-400 cursor-pointer flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) {
                  onSelect(currentPath);
                }
              }}
            >
              <FaFile className="mr-2 text-blue-400" />
              {name}
            </div>
          );
        }
      })}
    </div>
  );
};

export default FileTree;
