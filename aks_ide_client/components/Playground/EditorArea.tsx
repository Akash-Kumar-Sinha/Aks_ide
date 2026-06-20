"use client";

import dynamic from "next/dynamic";
import { SidebarInset } from "@/components/ui/sidebar";
import TerminalPanel from "./TerminalPanel";

const CodeEditor = dynamic(() => import("./CodeEditor"), { ssr: false });
import { StatusBar } from "./StatusBar";
import type { OpenFile, SaveStatus } from "./types";

interface EditorAreaProps {
  openFiles: OpenFile[];
  activeFileIdx: number;
  activeFile: OpenFile | null;
  onTabClick: React.Dispatch<React.SetStateAction<number>>;
  onTabClose: (index: number) => void;
  onSaveStatusChange: (status: SaveStatus) => void;
  saveStatus: SaveStatus;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  connected: boolean;
  language: string;
}

export function EditorArea({
  openFiles,
  activeFileIdx,
  activeFile,
  onTabClick,
  onTabClose,
  onSaveStatusChange,
  saveStatus,
  terminalOpen,
  onToggleTerminal,
  connected,
  language,
}: EditorAreaProps) {
  return (
    <SidebarInset className="flex flex-col min-h-0 overflow-hidden flex-1" style={{ background: "var(--ide-bg)" }}>
      <div className="flex-1 min-h-0">
        <CodeEditor
          openFiles={openFiles}
          activeFileIdx={activeFileIdx}
          onTabClick={onTabClick}
          onTabClose={onTabClose}
          onSaveStatusChange={onSaveStatusChange}
          onToggleTerminal={onToggleTerminal}
        />
      </div>

      <TerminalPanel
        open={terminalOpen}
        saveStatus={saveStatus}
        selectedFile={activeFile?.name}
      />

      <StatusBar
        connected={connected}
        selectedFile={activeFile?.name ?? ""}
        language={language}
        terminalOpen={terminalOpen}
        onToggleTerminal={onToggleTerminal}
      />
    </SidebarInset>
  );
}

export default EditorArea;
