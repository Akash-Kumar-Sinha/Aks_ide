"use client";

import Terminal from "./Terminal";
import type { SaveStatus } from "./types";

interface TerminalPanelProps {
  open: boolean;
  saveStatus: SaveStatus;
  selectedFile: string | undefined;
}

export function TerminalPanel({ open, saveStatus, selectedFile }: TerminalPanelProps) {
  return (
    <div
      className="shrink-0 overflow-hidden border-t"
      style={{
        height: open ? "45vh" : "0px",
        transition: "height 0.2s ease-in-out",
        borderColor: "var(--ide-border)",
      }}
    >
      <div style={{ height: "45vh" }}>
        <Terminal saveStatus={saveStatus} selectedFile={selectedFile}/>
      </div>
    </div>
  );
}

export default TerminalPanel;
