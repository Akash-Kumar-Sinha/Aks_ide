import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import useTheme from "../ui/lib/useTheme";
import { Loading } from "../ui/Loading/Loading";
import { Label } from "../ui/Label/Label";
import useUserProfile from "../../utils/useUserProfile";
import socket from "../../utils/Socket";

interface CodeProps {
  selectedFileAbsolutePath: string;
  selectedFile: string;
  onSaveStatusChange: (status: "idle" | "saving" | "saved" | "error") => void;
}

const CodeEditor: React.FC<CodeProps> = React.memo(
  ({ selectedFileAbsolutePath, selectedFile, onSaveStatusChange }) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const { theme } = useTheme();
    const { userProfile } = useUserProfile();
    const [codeContent, setCodeContent] = useState("");
    const [language, setLanguage] = useState("javascript");
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const currentFilePathRef = useRef<string>("");
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
      editorRef.current = editor;
    }

    const handleEditorChange = (value: string | undefined) => {
      if (
        isLoadingFile ||
        selectedFileAbsolutePath !== currentFilePathRef.current
      ) {
        return;
      }

      if (value === undefined || value === null) {
        return;
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      onSaveStatusChange("saving");

      saveTimeoutRef.current = setTimeout(() => {
        socket.emit("save_data", {
          email: userProfile?.email,
          path: selectedFileAbsolutePath,
          content: value,
        });
      }, 500);
    };

    const getFileContent = useCallback(
      (data: string) => {
        setCodeContent(data);
        setIsLoadingFile(false);
        currentFilePathRef.current = selectedFileAbsolutePath;
      },
      [selectedFileAbsolutePath]
    );

    const handleFileSaved = useCallback(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (message: string) => {
        onSaveStatusChange("saved");

        setTimeout(() => {
          onSaveStatusChange("idle");
        }, 2000);
      },
      [onSaveStatusChange]
    );

    const handleFileError = useCallback(
      (error: string) => {
        onSaveStatusChange("error");
        console.error("File save error:", error);

        setTimeout(() => {
          onSaveStatusChange("idle");
        }, 3000);
      },
      [onSaveStatusChange]
    );

    useEffect(() => {
      socket.on("files_data", getFileContent);
      socket.on("file_saved", handleFileSaved);
      socket.on("file_error", handleFileError);

      return () => {
        socket.off("files_data", getFileContent);
        socket.off("file_saved", handleFileSaved);
        socket.off("file_error", handleFileError);

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, [getFileContent, handleFileSaved, handleFileError]);

    useEffect(() => {
      if (selectedFileAbsolutePath && userProfile) {
        setIsLoadingFile(true);
        setCodeContent("");
        onSaveStatusChange("idle");

        socket.emit("get_files_data", {
          email: userProfile.email,
          path: selectedFileAbsolutePath,
        });
      }
    }, [
      selectedFileAbsolutePath,
      userProfile,
      userProfile?.email,
      onSaveStatusChange,
    ]);

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
          html: "html",
          css: "css",
          json: "json",
          md: "markdown",
          yaml: "yaml",
          yml: "yaml",
          sh: "shell",
          rb: "ruby",
        };
        setLanguage(languageMap[fileExtension] || "plaintext");
      }
    }, [selectedFileAbsolutePath]);

    return (
      <>
        {selectedFile ? (
          <div className="h-full w-full">
            <Editor
              height="100%"
              language={language}
              value={codeContent}
              onMount={handleEditorDidMount}
              onChange={handleEditorChange}
              theme="vs-dark"
              loading={<Loading />}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        ) : (
          <div
            className="flex items-center justify-center h-full w-full"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            <div className="flex flex-col justify-center items-center gap-2">
              <Label scale="xl" className="text-2xl">
                Aks IDE
              </Label>
              <Label dimmed>Select a file to begin coding</Label>
            </div>
          </div>
        )}
      </>
    );
  }
);

export default CodeEditor;
