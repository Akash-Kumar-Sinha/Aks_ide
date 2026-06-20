"use client";

import { useEffect, useRef, useState } from "react";
import socket from "@/utils/Socket";

export interface UseSocketConnectionReturn {
  connected: boolean;
  repoLoadedRef: React.MutableRefObject<boolean>;
  terminalReadyRef: React.MutableRefObject<boolean>;
}

export function useSocketConnection(): UseSocketConnectionReturn {
  const [connected, setConnected] = useState(socket?.connected ?? false);
  const repoLoadedRef = useRef(false);
  const terminalReadyRef = useRef(false);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => {
      setConnected(false);
      repoLoadedRef.current = false;
      terminalReadyRef.current = false;
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { connected, repoLoadedRef, terminalReadyRef };
}
