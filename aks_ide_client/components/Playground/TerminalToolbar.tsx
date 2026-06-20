"use client";

import { RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConnectionStatus } from "@/components/Playground/ConnectionStatus";
import { SaveStatusBadge } from "./SaveStatusBadge";
import type { SaveStatus } from "./types";

interface TerminalToolbarProps {
  saveStatus: SaveStatus;
  selectedFile?: string;
  connected: boolean;
  activeTerminalId: string;
  tabActive: Record<string, boolean>;
  tabReady: Record<string, boolean>;
  activeIsReady: boolean;
  onClear: () => void;
  onReload: () => void;
}

export function TerminalToolbar({
  saveStatus,
  selectedFile,
  connected,
  activeTerminalId,
  tabActive,
  tabReady,
  activeIsReady,
  onClear,
  onReload,
}: TerminalToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-3 shrink-0">
      <SaveStatusBadge saveStatus={saveStatus} selectedFile={selectedFile} />
      <ConnectionStatus
        connected={connected}
        terminalActive={!!tabActive[activeTerminalId]}
        terminalReady={!!tabReady[activeTerminalId]}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClear}
            disabled={!activeIsReady}
            className="px-2 py-0.5 text-[10px] rounded transition-colors disabled:opacity-30 text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
          >
            Clear
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Clear terminal output</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onReload}
            disabled={!connected}
            className="p-1 rounded transition-colors disabled:opacity-30 text-zinc-600 hover:text-zinc-300 hover:bg-white/5"
          >
            <RefreshCw size={10} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Reload terminal</TooltipContent>
      </Tooltip>
    </div>
  );
}
