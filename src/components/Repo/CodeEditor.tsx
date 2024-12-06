import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import axios from "axios";

import { socket } from "@/utils/Socket";
import Loading from "../Loading";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface CodeProps {
  selectedFileAbsolutePath: string;
  selectedFile: string;
}

const CodeEditor: React.FC<CodeProps> = React.memo(
  ({ selectedFileAbsolutePath, selectedFile }) => {
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
          socket.emit("write_code", {
            filePath: selectedFileAbsolutePath,
            code: value,
          });
        }
      }
    };

    const getFileContent = useCallback(async () => {
      if (!selectedFileAbsolutePath) return;

      setContentLoading(true);
      console.log("Fetching file content...");

      try {
        const response = await axios.get(`${SERVER_URL}/repo/content`, {
          params: { filePath: selectedFileAbsolutePath },
          withCredentials: true,
        });
        console.log("response", response.data.content);
        if (response.status === 200) {
          const cleanContent = response.data.content
            .replace(/^\uFEFF/, "")
            // eslint-disable-next-line no-control-regex
            .replace(/[^\x20-\x7E\x0A\x0D]/g, "")
            .trim();
          setFetchCodeContent(cleanContent);
          setCodeContent(cleanContent);
        }
      } catch (error) {
        console.error("Error fetching file content:", error);
      } finally {
        setContentLoading(false);
      }
    }, [selectedFileAbsolutePath]);

    useEffect(() => {
      getFileContent();
    }, [selectedFileAbsolutePath, getFileContent]);

    useEffect(() => {
      if (fetchCodeContent) {
        setCodeContent(fetchCodeContent);
      }
    }, [fetchCodeContent]);

    useEffect(() => {
      if (selectedFileAbsolutePath) {
        const fileExtension = selectedFileAbsolutePath.split(".").pop() || "";
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
    }, [selectedFileAbsolutePath]);

    return (
      <>
        {contentLoading ? (
          <div className="h-full w-full flex flex-col justify-center items-center bg-zinc-950">
            <Loading size={70} />
            <p className="mt-4 text-zinc-300 text-lg">Opening file...</p>
          </div>
        ) : (
          <>
            {selectedFile ? (
              <div className="w-full h-full bg-zinc-900 border border-zinc-600 rounded-lg overflow-hidden">
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
                    wrappingIndent: "same",
                  }}
                  loading={<Loading />}
                />
              </div>
            ) : (
              <div className="h-full w-full flex flex-col text-center justify-center items-center text-yellow-400">
                <h1 className="lg:text-3xl font-semibold">Aks IDE</h1>
                <p className="lg:text-lg mt-4 text-center">
                  Select a file to begin coding
                </p>
              </div>
            )}
          </>
        )}
      </>
    );
  }
);

export default CodeEditor;
