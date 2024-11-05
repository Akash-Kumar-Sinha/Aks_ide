import React from "react";
import { useParams } from "react-router-dom";

import FileTree from "./FileTree";
import Back from "@/components/Back";

interface FilesSidebarProps {
  fileStructure: Record<string, unknown | null>;
  setSelectedFile: (path: string) => void;
}

const FilesSidebar: React.FC<FilesSidebarProps> = ({
  fileStructure,
  setSelectedFile,
}) => {
  const { repoId } = useParams();

  const handleSelect = (path: string) => {
    setSelectedFile(path);
    console.log("Selected file path:", path);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-64 bg-zinc-900 flex justify-between items-center text-xs px-2 gap-2 rounded-b-2xl">
        <Back size={22} />
        <p className="font-normal text-[10px] text-gray-300 hover:underline cursor-pointer text-center">
          Repo ID: {repoId}
        </p>
      </div>

      <div>
        <h2 className="text-gray-400 font-bold text-sm mt-2 px-2">Explorer</h2>

        <div className="flex-grow p-2">
          {fileStructure && Object.keys(fileStructure).length > 0 ? (
            <FileTree tree={fileStructure} path="" onSelect={handleSelect} />
          ) : (
            <div className="text-gray-500 text-center">No files found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilesSidebar;
