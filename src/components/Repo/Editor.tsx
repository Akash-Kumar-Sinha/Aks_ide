import React from "react";
import FilesSidebar from "./Sidebar/FilesSidebar";
import Code from "./Code";

const Editor = ({
  fileStructure,
}: {
  fileStructure: Record<string, unknown | null>;
}) => {
  return (
    <div className="flex w-full bg-black rounded-lg shadow-md overflow-hidden">
      <FilesSidebar fileStructure={fileStructure} />
      <div className="flex-grow flex flex-col overflow-auto">
        <Code />
      </div>
    </div>
  );
};

export default Editor;
