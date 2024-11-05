import React, { useState } from "react";
import CodeEditor from "./CodeEditor";
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
  const [isExplorerVisible, setExplorerVisible] = useState(true);
  const [isAnimating, setAnimating] = useState(false);

  const toggleExplorer = () => {
    setAnimating(true);
    setExplorerVisible((prev) => !prev);
    setTimeout(() => {
      setAnimating(false);
    }, 300);
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
              setSelectedFile={setSelectedFile}
            />
          )}
        </div>
      </div>
      <CodeEditor />
    </div>
  );
};

export default Editor;
