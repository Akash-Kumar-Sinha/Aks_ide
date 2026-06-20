"use client";

import { useCallback, useEffect, useState } from "react";

export interface UseFullScreenReturn {
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}

export function useFullScreen(): UseFullScreenReturn {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    if (!isFullScreen) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
      window.dispatchEvent(new Event("resize"));
    }
  }, [isFullScreen]);

  useEffect(() => {
    const onChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      if (!document.fullscreenElement) {
        setTimeout(() => window.dispatchEvent(new Event("resize")), 100);
      }
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  return { isFullScreen, toggleFullScreen };
}
