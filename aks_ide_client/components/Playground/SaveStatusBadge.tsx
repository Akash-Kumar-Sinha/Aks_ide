"use client";

import { Badge } from "@/components/ui/badge";
import type { SaveStatus } from "./types";

interface SaveStatusBadgeProps {
  saveStatus: SaveStatus;
  selectedFile?: string;
}

export function SaveStatusBadge({ saveStatus, selectedFile }: SaveStatusBadgeProps) {
  if (!selectedFile || saveStatus === "idle") return null;
  if (saveStatus === "saving")
    return <Badge variant="secondary" className="text-[10px] h-4 px-1.5 animate-pulse">Saving</Badge>;
  if (saveStatus === "saved")
    return <Badge variant="outline" className="text-[10px] h-4 px-1.5 text-emerald-400 border-emerald-400/30">Saved</Badge>;
  return <Badge variant="destructive" className="text-[10px] h-4 px-1.5">Error</Badge>;
}
