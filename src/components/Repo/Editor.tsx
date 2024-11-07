import React, { useState } from "react";
import CodeEditor from "./CodeEditor";
import SideBar from "./Sidebar/SideBar";
import Explorer from "./Sidebar/Explorer";

interface EditorProps {
  fileStructure: Record<string, unknown | null>;
  setSelectedFile: (path: string) => void;
  createTemplate: () => void;
  projectName: React.RefObject<HTMLInputElement>;
  explorerloadingStatus: boolean;
  selectedFileAbsolutePath: string;
}

const Editor: React.FC<EditorProps> = ({
  fileStructure,
  setSelectedFile,
  createTemplate,
  projectName,
  explorerloadingStatus,
  selectedFileAbsolutePath,
}) => {
  const [isExplorerVisible, setExplorerVisible] = useState(true);
  const [isAnimating, setAnimating] = useState(false);

  const toggleExplorer = () => {
    setAnimating(true);
    setExplorerVisible((prev) => !prev);
    setTimeout(() => {
      setAnimating(false);
    }, 300);
  };

  const handleSelect = (path: string) => {
    setSelectedFile(path);
    console.log(selectedFileAbsolutePath);
  };

  return (
    <div className="relative h-full flex">
      <div className="flex">
        <SideBar
          isExplorerVisible={isExplorerVisible}
          toggleExplorer={toggleExplorer}
        />
        <div
          className={`explorer-container transition-all duration-300 ease-in-out ${
            isExplorerVisible ? "explorer-visible p-2 " : "explorer-hidden"
          }`}
          style={{
            width: isExplorerVisible ? "240px" : "0",
            overflow: "hidden",
            backgroundColor: isExplorerVisible ? "#1A1A1F" : "transparent",
          }}
        >
          {isExplorerVisible && !isAnimating && (
            <Explorer
              projectName={projectName}
              createTemplate={createTemplate}
              fileStructure={fileStructure}
              explorerloadingStatus={explorerloadingStatus}
              handleSelect={handleSelect}
            />
          )}
        </div>
      </div>
      <CodeEditor 
      selectedFileAbsolutePath={selectedFileAbsolutePath}
      />
    </div>
  );
};

export default Editor;
