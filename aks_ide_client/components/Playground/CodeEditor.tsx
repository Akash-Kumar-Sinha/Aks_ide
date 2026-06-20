"use client";

import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { Skeleton } from "@/components/ui/skeleton";
import useUserProfile from "@/utils/useUserProfile";
import { useEditorFiles } from "./hooks/useEditorFiles";
import { EditorTabBar } from "./EditorTabBar";
import { EditorBreadcrumb } from "./EditorBreadcrumb";
import { getLanguage } from "./types";
import type { OpenFile } from "./types";

interface CodeEditorProps {
  openFiles: OpenFile[];
  activeFileIdx: number;
  onTabClick: (index: number) => void;
  onTabClose: (index: number) => void;
  onSaveStatusChange: (status: "idle" | "saving" | "saved" | "error") => void;
  onToggleTerminal?: () => void;
}

const CodeEditor: React.FC<CodeEditorProps> = React.memo(
  ({ openFiles, activeFileIdx, onTabClick, onTabClose, onSaveStatusChange, onToggleTerminal }) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const { userProfile } = useUserProfile();

    const activeFile = openFiles[activeFileIdx] ?? null;

    const { codeContent, modifiedPaths, onEditorChange } = useEditorFiles({
      activeFile,
      email: userProfile?.email,
      onSaveStatusChange,
    });

    function handleBeforeMount(m: typeof monaco) {
      const opts: monaco.languages.typescript.CompilerOptions = {
        jsx: m.languages.typescript.JsxEmit.React,
        allowJs: true,
        allowSyntheticDefaultImports: true,
      };
      m.languages.typescript.typescriptDefaults.setCompilerOptions(opts);
      m.languages.typescript.javascriptDefaults.setCompilerOptions(opts);
      m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });
      m.languages.typescript.javascriptDefaults.setDiagnosticsOptions({ noSemanticValidation: true, noSyntaxValidation: false });
    }

    function handleEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
      editorRef.current = editor;
      if (onToggleTerminal) {
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Backquote, onToggleTerminal);
      }
    }

    const language = activeFile ? getLanguage(activeFile.name) : "plaintext";

    return (
      <div className="flex flex-col h-full" style={{ background: "var(--ide-surface)" }}>
        <EditorTabBar
          openFiles={openFiles}
          activeFileIdx={activeFileIdx}
          modifiedPaths={modifiedPaths}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
        />

        {activeFile && <EditorBreadcrumb absolutePath={activeFile.absolutePath} />}

        <div className="flex-1 min-h-0">
          {activeFile ? (
            <Editor
              path={activeFile.absolutePath}
              height="100%"
              language={language}
              value={codeContent}
              beforeMount={handleBeforeMount}
              onMount={handleEditorDidMount}
              onChange={onEditorChange}
              theme="vs-dark"
              loading={
                <div className="flex flex-col gap-3 p-4">
                  <Skeleton className="h-4 w-3/4" style={{ background: "var(--ide-elevated)" }} />
                  <Skeleton className="h-4 w-1/2" style={{ background: "var(--ide-elevated)" }} />
                  <Skeleton className="h-4 w-2/3" style={{ background: "var(--ide-elevated)" }} />
                </div>
              }
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                fontFamily: "monospace",
                lineHeight: 1.6,
                padding: { top: 8 },
                renderLineHighlight: "gutter",
                smoothScrolling: true,
              }}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center h-full gap-4"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%), var(--ide-surface)",
              }}
            >
              <span className="text-3xl font-semibold tracking-widest uppercase bg-linear-to-r from-blue-500/50 to-zinc-600 bg-clip-text text-transparent select-none">
                AKS IDE
              </span>
              <p className="text-xs text-zinc-700 select-none">
                Open a file from the explorer to start editing
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

CodeEditor.displayName = "CodeEditor";
export default CodeEditor;
