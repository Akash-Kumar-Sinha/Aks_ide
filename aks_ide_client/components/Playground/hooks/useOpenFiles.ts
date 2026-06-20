"use client";

import { useCallback, useState } from "react";
import type { OpenFile, SaveStatus } from "../types";

export interface UseOpenFilesReturn {
  openFiles: OpenFile[];
  activeFileIdx: number;
  activeFile: OpenFile | null;
  openFile: (name: string, absolutePath: string) => void;
  closeFile: (index: number) => void;
  setActiveFileIdx: React.Dispatch<React.SetStateAction<number>>;
  saveStatus: SaveStatus;
  onSaveStatusChange: (status: SaveStatus) => void;
}

export function useOpenFiles(): UseOpenFilesReturn {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileIdx, setActiveFileIdx] = useState(-1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const activeFile = openFiles[activeFileIdx] ?? null;

  const openFile = useCallback((name: string, absolutePath: string) => {
    setOpenFiles((prev) => {
      const existing = prev.findIndex((f) => f.absolutePath === absolutePath);
      if (existing !== -1) {
        setActiveFileIdx(existing);
        return prev;
      }
      const next = [...prev, { name, absolutePath }];
      setActiveFileIdx(next.length - 1);
      return next;
    });
  }, []);

  const closeFile = useCallback((index: number) => {
    setOpenFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setActiveFileIdx((active) => {
        if (next.length === 0) return -1;
        if (index < active) return active - 1;
        if (index === active) return Math.min(active, next.length - 1);
        return active;
      });
      return next;
    });
  }, []);

  const onSaveStatusChange = useCallback((status: SaveStatus) => {
    setSaveStatus(status);
  }, []);

  return { openFiles, activeFileIdx, activeFile, openFile, closeFile, setActiveFileIdx, saveStatus, onSaveStatusChange };
}
