import React from "react";

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
              <div className="text-zinc-50 font-normal">{name}</div>
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
              className="text-gray-400 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) {
                  onSelect(currentPath);
                }
              }}
            >
              {name}
            </div>
          );
        }
      })}
    </div>
  );
};

export default FileTree;
