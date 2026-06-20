"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import socket from "@/utils/Socket";
import type { OpenFile, SaveStatus } from "../types";

interface UseEditorFilesOptions {
  activeFile: OpenFile | null;
  email: string | undefined;
  onSaveStatusChange: (status: SaveStatus) => void;
}

export function useEditorFiles({ activeFile, email, onSaveStatusChange }: UseEditorFilesOptions) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [modifiedPaths, setModifiedPaths] = useState<Set<string>>(new Set());

  const saveTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingFetchesRef = useRef<string[]>([]);
  const pendingSavesRef = useRef<string[]>([]);
  const codeContentRef = useRef<Record<string, string>>({});

  const onEditorChange = (value: string | undefined) => {
    if (!activeFile || value === undefined) return;
    const path = activeFile.absolutePath;
    codeContentRef.current[path] = value;
    setModifiedPaths((prev) => {
      if (prev.has(path)) return prev;
      const next = new Set(prev);
      next.add(path);
      return next;
    });
    if (saveTimeoutsRef.current[path]) clearTimeout(saveTimeoutsRef.current[path]);
    onSaveStatusChange("saving");
    saveTimeoutsRef.current[path] = setTimeout(() => {
      pendingSavesRef.current.push(path);
      socket.emit("save_data", { email, path, content: value });
      delete saveTimeoutsRef.current[path];
    }, 500);
  };

  const getFileContent = useCallback((data: string) => {
    const path = pendingFetchesRef.current.shift();
    if (!path) return;
    codeContentRef.current[path] = data;
    forceUpdate();
  }, []);

  const handleFileSaved = useCallback((_message: string) => {
    const savedPath = pendingSavesRef.current.shift();
    if (savedPath) {
      setModifiedPaths((prev) => {
        const next = new Set(prev);
        next.delete(savedPath);
        return next;
      });
    }
    onSaveStatusChange("saved");
    setTimeout(() => onSaveStatusChange("idle"), 2000);
  }, [onSaveStatusChange]);

  const handleFileError = useCallback((error: string) => {
    onSaveStatusChange("error");
    console.error("File save error:", error);
    setTimeout(() => onSaveStatusChange("idle"), 3000);
  }, [onSaveStatusChange]);

  useEffect(() => {
    socket.on("files_data", getFileContent);
    socket.on("file_saved", handleFileSaved);
    socket.on("file_error", handleFileError);
    return () => {
      socket.off("files_data", getFileContent);
      socket.off("file_saved", handleFileSaved);
      socket.off("file_error", handleFileError);
      Object.values(saveTimeoutsRef.current).forEach(clearTimeout);
    };
  }, [getFileContent, handleFileSaved, handleFileError]);

  useEffect(() => {
    if (!activeFile || !email) return;
    if (codeContentRef.current[activeFile.absolutePath] !== undefined) return;
    pendingFetchesRef.current.push(activeFile.absolutePath);
    socket.emit("get_files_data", { email, path: activeFile.absolutePath });
  }, [activeFile?.absolutePath, email]);

  const codeContent = activeFile
    ? (codeContentRef.current[activeFile.absolutePath] ?? "")
    : "";

  return { codeContent, modifiedPaths, onEditorChange };
}
