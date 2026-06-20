"use client";

import { Terminal as TerminalIcon, Plus, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TerminalTab } from "./hooks/useTerminal";

interface TerminalTabBarProps {
  tabs: TerminalTab[];
  activeId: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onAdd: () => void;
}

export function TerminalTabBar({ tabs, activeId, onTabClick, onTabClose, onAdd }: TerminalTabBarProps) {
  return (
    <div className="flex items-center flex-1 overflow-x-auto custom-scroll min-w-0">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onTabClick(tab.id)}
            className="relative flex items-center gap-1.5 h-8 px-3 shrink-0 text-[10px] font-medium uppercase tracking-wider transition-colors group border-r"
            style={{
              borderColor: "var(--ide-border)",
              color: isActive ? "#e4e4e7" : "#4a4a55",
            }}
          >
            <TerminalIcon className="w-3 h-3" />
            <span>{tab.label}</span>
            {tabs.length > 1 && (
              <span
                onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}
                className="w-3 h-3 flex items-center justify-center rounded hover:bg-white/10 text-zinc-600 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all"
                role="button"
              >
                <X className="w-2 h-2" />
              </span>
            )}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: "var(--ide-tab-line)" }}
              />
            )}
          </button>
        );
      })}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onAdd}
            className="h-8 w-7 flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-colors shrink-0 border-r"
            style={{ borderColor: "var(--ide-border)" }}
          >
            <Plus className="w-3 h-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">New terminal</TooltipContent>
      </Tooltip>
    </div>
  );
}
