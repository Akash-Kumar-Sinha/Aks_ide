import React from "react";

// import FilesSidebar from "./Sidebar/FilesSidebar";
import CodeEditor from "./CodeEditor";
// import Loading from "../Loading";
import SideBar from "./Sidebar/SideBar";
import Explorer from "./Sidebar/Explorer";

interface EditorProps {
  fileStructure: Record<string, unknown | null>;
  setSelectedFile: (path: string) => void;
  createTemplate: () => void;
  projectName: React.RefObject<HTMLInputElement>;
}

const Editor: React.FC<EditorProps> = ({
  fileStructure,
  setSelectedFile,
  createTemplate,
  projectName,
}) => {
  return (
    <div className="relative h-full flex">
      <div className=" flex">
        <SideBar />
        <Explorer
          projectName={projectName}
          createTemplate={createTemplate}
          fileStructure={fileStructure}
          setSelectedFile={setSelectedFile}
        />
      </div>
      <CodeEditor />
    </div>
  );
};

export default Editor;

{ /* 
  <div className="flex h-full bg-zinc-900 rounded-2xl shadow-lg w-full overflow-hidden">
      <div className="w-64 bg-zinc-800 border-r rounded-2xl border-gray-700 overflow-y-auto h-full">
        {directoryLoading ? (
          <div className="h-full flex flex-col justify-center items-center">
            <Loading size={60} />
            <p className="mt-4 text-gray-300 text-lg">Loading directory...</p>
          </div>
        ) : (
          <FilesSidebar
            fileStructure={fileStructure}
            setSelectedFile={setSelectedFile}
          />
        )}
      </div>

      <div className="flex-grow flex flex-col bg-zinc-950 p-1">
        <div className="flex-grow rounded-2xl border border-gray-700 overflow-hidden">
          <Code selectedFile={selectedFile} />
        </div>
      </div>
    </div> */
}
