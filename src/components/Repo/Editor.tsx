import React from "react";
import FilesSidebar from "./Sidebar/FilesSidebar";
import Code from "./Code";

interface EditorProps {
  fileStructure: Record<string, unknown | null>;
}

const Editor: React.FC<EditorProps> = ({ fileStructure }) => {
  const [selectedFile, setSelectedFile] = React.useState<string>("");
  return (
    <div className="flex w-full h-full bg-black rounded-lg shadow-md">
      <FilesSidebar
        fileStructure={fileStructure}
        setSelectedFile={setSelectedFile}
      />
      <div className="flex-grow flex flex-col">
        <Code selectedFile={selectedFile} />
      </div>
    </div>
  );
};

export default Editor;
