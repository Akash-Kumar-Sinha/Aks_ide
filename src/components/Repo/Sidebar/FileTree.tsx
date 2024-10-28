import React from "react";

interface FileTreeProps {
  tree: Record<string, unknown | null>;
}

const FileTree: React.FC<FileTreeProps> = ({ tree }) => {
  const renderFileTree = (tree: Record<string, unknown | null>) => {
    return Object.entries(tree).map(([name, value]) => {
      if (value !== null && typeof value === "object") {
        return (
          <div key={name}>
            <div className="text-zinc-50 font-normal">{name}</div>
            <div className="ml-4">
              {renderFileTree(value as Record<string, unknown | null>)}
            </div>
          </div>
        );
      } else {
        return (
          <div key={name} className="text-gray-400">
            {name}
          </div>
        );
      }
    });
  };

  return <>{renderFileTree(tree)}</>;
};

export default FileTree;
