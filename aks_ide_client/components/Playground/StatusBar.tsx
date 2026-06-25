"use client";

import { Terminal as TerminalIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatusBarProps {
  connected: boolean;
  selectedFile: string;
  language: string;
  terminalOpen?: boolean;
  onToggleTerminal?: () => void;
}

export function StatusBar({
  connected,
  selectedFile,
  language,
  terminalOpen,
  onToggleTerminal,
}: StatusBarProps) {
  return (
    <div
      className="shrink-0 h-6 flex items-center justify-between px-3"
      style={{
        background: "var(--ide-panel)",
        borderTop: "1px solid var(--ide-border)",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500" : "bg-red-500/70 animate-pulse"}`}
          />
          <span className="text-[10px] font-mono text-zinc-600">
            {connected ? "Connected" : "Disconnected"}
          </span>
        </div>
        {selectedFile && (
          <>
            <span className="text-zinc-700 text-[10px]">·</span>
            <span className="text-[10px] font-mono text-zinc-600 max-w-50 truncate">
              {selectedFile}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {language && language !== "plaintext" && (
          <span className="text-[10px] font-mono text-zinc-600 capitalize">
            {language}
          </span>
        )}
        <span className="text-[10px] font-mono text-zinc-700">UTF-8</span>
        {onToggleTerminal && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleTerminal}
                className={`flex items-center gap-1 text-[10px] font-mono px-1.5 rounded transition-colors ${
                  terminalOpen
                    ? "text-blue-400"
                    : "text-zinc-600 hover:text-zinc-300"
                }`}
              >
                <TerminalIcon className="w-3 h-3" />
                <span>Terminal</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Toggle terminal (Ctrl+`)</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

export default StatusBar;
