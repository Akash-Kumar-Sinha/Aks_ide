import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import axios from "axios";

import { socket } from "@/utils/Socket";
import Loading from "../Loading";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface CodeProps {
  selectedFile?: string;
}

const CodeEditor: React.FC<CodeProps> = ({ selectedFile }) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [codeContent, setCodeContent] = useState<string>("");
  const [fetchCodeContent, setFetchCodeContent] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [contentLoading, setContentLoading] = useState<boolean>(false);

  const isSaved = codeContent === fetchCodeContent;

  function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    console.log("Editor mounted");
    
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setCodeContent(value);
      if (!isSaved) {
        socket.emit("code_change", { filePath: selectedFile, code: value });
      }
    }
  };

  const getFileContent = useCallback(async () => {
    if (!selectedFile) return;

    setContentLoading(true);

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
    } finally {
      setContentLoading(false);
    }
  }, [selectedFile]);

  useEffect(() => {
    getFileContent();
  }, [selectedFile, getFileContent]);

  useEffect(() => {
    if (fetchCodeContent) {
      setCodeContent(fetchCodeContent);
    }
  }, [fetchCodeContent]);

  useEffect(() => {
    if (selectedFile) {
      const fileExtension = selectedFile.split(".").pop() || "";
      const languageMap: Record<string, string> = {
        js: "javascript",
        ts: "typescript",
        py: "python",
        java: "java",
        rs: "rust",
        go: "go",
        cpp: "cpp",
        c: "c",
      };
      setLanguage(languageMap[fileExtension] || "plaintext");
    }
  }, [selectedFile]);
  

  return (
    <>
      {contentLoading ? (
        <div className="h-full w-full flex flex-col justify-center items-center">
          <Loading size={70} />
          <p className="mt-4 text-gray-300 text-lg">Opening directory...</p>
        </div>
      ) : (
        <Editor
          defaultLanguage={language}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          value={codeContent}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
          }}
          loading={<Loading />}
          className="flex-grow"
        />
      )}
    </>
  );
};

export default CodeEditor;