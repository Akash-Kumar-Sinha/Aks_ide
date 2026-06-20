"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import socket from "@/utils/Socket";

export type TreeNode = { name: string; is_dir: boolean; path: string };

interface RepoStructureResponse {
  current_directory: string;
  items: TreeNode[];
}

interface UseFileNavigationOptions {
  email: string | undefined;
  repoLoadedRef: React.MutableRefObject<boolean>;
  terminalReadyRef: React.MutableRefObject<boolean>;
}

export interface UseFileNavigationReturn {
  treeMap: Map<string, TreeNode[]>;
  fetchingPaths: Set<string>;
  explorerLoadingStatus: boolean;
  openRepo: () => void;
  fetchPath: (path: string) => void;
}

export function useFileNavigation({
  email,
  repoLoadedRef,
  terminalReadyRef,
}: UseFileNavigationOptions): UseFileNavigationReturn {
  const [treeMap, setTreeMap] = useState<Map<string, TreeNode[]>>(new Map());
  const [fetchingPaths, setFetchingPaths] = useState<Set<string>>(new Set());
  const [explorerLoadingStatus, setExplorerLoadingStatus] = useState(true);

  const fetchingRef = useRef<Set<string>>(new Set());

  const openRepo = useCallback(() => {
    if (!email) return;
    setExplorerLoadingStatus(true);
    setTreeMap(new Map());
    fetchingRef.current.clear();
    setFetchingPaths(new Set());
    socket.emit("repo_tree", { email, path: "/" });
  }, [email]);

  const fetchPath = useCallback(
    (path: string) => {
      if (!email || fetchingRef.current.has(path)) return;
      fetchingRef.current.add(path);
      setFetchingPaths((prev) => new Set(prev).add(path));
      socket.emit("repo_tree", { email, path });
    },
    [email],
  );

  useEffect(() => {
    if (!email) return;

    const onRepoStructure = (data: RepoStructureResponse) => {
      const dir = data.current_directory;
      setTreeMap((prev) => new Map(prev).set(dir, data.items ?? []));
      fetchingRef.current.delete(dir);
      setFetchingPaths((prev) => {
        const next = new Set(prev);
        next.delete(dir);
        return next;
      });
      setExplorerLoadingStatus(false);
    };

    const onTerminalError = () => setExplorerLoadingStatus(false);

    const onTerminalSuccess = () => {
      terminalReadyRef.current = true;
      if (!repoLoadedRef.current) {
        repoLoadedRef.current = true;
        openRepo();
      }
    };

    socket.on("repo_structure", onRepoStructure);
    socket.on("terminal_error", onTerminalError);
    socket.on("terminal_success", onTerminalSuccess);

    return () => {
      socket.off("repo_structure", onRepoStructure);
      socket.off("terminal_error", onTerminalError);
      socket.off("terminal_success", onTerminalSuccess);
    };
  }, [email, openRepo, repoLoadedRef, terminalReadyRef]);

  useEffect(() => {
    if (!email) return;
    const bootstrap = () =>
      socket.emit("load_terminal", { email, terminalId: "t1" });
    if (socket.connected) bootstrap();
    socket.on("connect", bootstrap);
    return () => {
      socket.off("connect", bootstrap);
    };
  }, [email]);

  useEffect(() => {
    if (!email) return;
    if (terminalReadyRef.current && !repoLoadedRef.current) {
      repoLoadedRef.current = true;
      openRepo();
    }
  }, [email, openRepo, repoLoadedRef, terminalReadyRef]);

  return { treeMap, fetchingPaths, explorerLoadingStatus, openRepo, fetchPath };
}
