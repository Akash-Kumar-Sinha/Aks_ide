"use client";

import { ChevronRight } from "lucide-react";

function getBreadcrumbs(absolutePath: string): string[] {
  if (!absolutePath) return [];
  const parts = absolutePath.split("/").filter(Boolean);
  return parts.length <= 3 ? parts : ["…", ...parts.slice(-2)];
}

interface EditorBreadcrumbProps {
  absolutePath: string;
}

export function EditorBreadcrumb({ absolutePath }: EditorBreadcrumbProps) {
  const segments = getBreadcrumbs(absolutePath);
  if (segments.length === 0) return null;

  return (
    <div
      className="flex items-center gap-0.5 h-7 px-3 shrink-0"
      style={{ background: "var(--ide-surface)", borderBottom: "1px solid var(--ide-border)" }}
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-0.5">
            {i > 0 && <ChevronRight className="size-3 text-zinc-500 shrink-0" />}
            <span
              className={`text-[11px] font-mono truncate ${
                isLast
                  ? "text-zinc-200 font-medium"
                  : "text-zinc-500 hover:text-zinc-300 transition-colors"
              }`}
            >
              {seg}
            </span>
          </span>
        );
      })}
    </div>
  );
}
