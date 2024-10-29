import React from "react";
import FileTree from "./FileTree";

interface FilesSidebarProps {
  fileStructure: Record<string, unknown | null>;
  setSelectedFile:(path: string)=>void;

}

const FilesSidebar: React.FC<FilesSidebarProps> = ({ fileStructure, setSelectedFile }) => {
  const handleSelect = (path: string) => {
    setSelectedFile(path);
    console.log("Selected file path:", path);
  };

  return (
    <div className="w-52 bg-zinc-800 p-2 border-b-2 border-r-2 rounded-r-3xl border-gray-700 overflow-auto">
      <h2 className="text-white font-semibold">Explorer</h2>
      <div className="mt-1">
        {fileStructure && Object.keys(fileStructure).length > 0 ? (
          <FileTree tree={fileStructure} path="" onSelect={handleSelect} />
        ) : (
          <div className="text-gray-500">No files found</div>
        )}
      </div>
    </div>
  );
};

export default FilesSidebar;
