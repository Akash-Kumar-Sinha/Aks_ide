import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { socket } from "@/utils/Socket";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface CodeProps {
  selectedFile?: string;
}

const Code: React.FC<CodeProps> = ({ selectedFile }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [codeContent, setCodeContent] = useState<string>("");
  const [fetchCodeContent, setFetchCodeContent] = useState<string>("");

  const isSaved = codeContent === fetchCodeContent;

  function handleEditorDidMount(
    editor: monaco.editor.IStandaloneCodeEditor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    monaco: Monaco
  ) {
    editorRef.current = editor;
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCodeContent(value);
    }
  };

  useEffect(() => {
    if (selectedFile && codeContent && !isSaved) {
      socket.emit("code_change", { filePath: selectedFile, code: codeContent });
    }
  }, [codeContent, isSaved]);

  const getFileContent = useCallback(async () => {
    if (!selectedFile) return;
    try {
      const response = await axios.get(`${SERVER_URL}/repo/content`, {
        params: { filePath: selectedFile },
        withCredentials: true,
      });
      if (response.status === 200) {
        setFetchCodeContent(response.data.content);
        setCodeContent(response.data.content);
      }
    } catch (error) {
      console.error("Error fetching file content:", error);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      getFileContent();
    }
  }, [selectedFile, getFileContent]);

  useEffect(() => {
    if (selectedFile && fetchCodeContent) {
      setCodeContent(fetchCodeContent);
    }
  }, [fetchCodeContent, selectedFile]);

  return (
    <div className="h-96">
      <div className="text-xs text-gray-600 font-semibold tracking-wider">
        {selectedFile}
      </div>
      <Editor
        defaultLanguage="typescript"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
        value={codeContent}
      />
    </div>
  );
};

export default Code;
