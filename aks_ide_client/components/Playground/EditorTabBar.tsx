"use client";

import { X } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { OpenFile } from "./types";

interface EditorTabBarProps {
  openFiles: OpenFile[];
  activeFileIdx: number;
  modifiedPaths: Set<string>;
  onTabClick: (index: number) => void;
  onTabClose: (index: number) => void;
}

export function EditorTabBar({
  openFiles, activeFileIdx, modifiedPaths, onTabClick, onTabClose,
}: EditorTabBarProps) {
  return (
    <div
      className="flex items-end h-9 shrink-0"
      style={{ background: "var(--ide-panel)", borderBottom: "1px solid var(--ide-border)" }}
    >
      <ScrollArea className="flex-1 h-9">
        <div className="flex items-end h-9 min-w-0">
          {openFiles.length === 0 ? (
            <div className="flex-1" />
          ) : (
            openFiles.map((file, i) => {
              const isActive = i === activeFileIdx;
              return (
                <button
                  key={file.absolutePath}
                  onClick={() => onTabClick(i)}
                  className="relative flex items-center gap-1.5 h-9 px-3 shrink-0 border-r text-xs transition-colors group"
                  style={{
                    borderColor: "var(--ide-border)",
                    color: isActive ? "#e4e4e7" : "#a1a1aa",
                    background: isActive ? "var(--ide-surface)" : "transparent",
                  }}
                >
                  <span className="max-w-30 truncate">{file.name.split("/").pop()}</span>
                  {modifiedPaths.has(file.absolutePath) ? (
                    <span className="text-blue-400 text-[8px] leading-none" title="Unsaved changes">●</span>
                  ) : (
                    <span
                      onClick={(e) => { e.stopPropagation(); onTabClose(i); }}
                      className="size-3.5 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                      style={{ cursor: "pointer" }}
                      role="button"
                      aria-label={`Close ${file.name}`}
                    >
                      <X className="size-2.5" />
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
            })
          )}
        </div>
        <ScrollBar orientation="horizontal" className="h-0.5" />
      </ScrollArea>
    </div>
  );
}
