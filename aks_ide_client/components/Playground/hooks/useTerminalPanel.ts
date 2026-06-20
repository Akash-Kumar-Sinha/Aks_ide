"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseTerminalPanelReturn {
  terminalOpen: boolean;
  handleTerminalOpenChange: (open: boolean) => void;
  toggle: () => void;
}

export function useTerminalPanel(): UseTerminalPanelReturn {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const openRef = useRef(false);

  const setOpen = useCallback((open: boolean) => {
    openRef.current = open;
    setTerminalOpen(open);
    if (open) {
      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
      setTimeout(() => window.dispatchEvent(new Event("resize")), 250);
    }
  }, []);

  const toggle = useCallback(() => setOpen(!openRef.current), [setOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.code !== "Backquote") return;
      // Skip when Monaco has focus - the Monaco keybinding registered in
      // CodeEditor handles it there. Without this guard, both handlers fire
      // and the toggles cancel each other out.
      if ((e.target as Element)?.closest?.(".monaco-editor")) return;
      e.preventDefault();
      e.stopPropagation();
      toggle();
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKey, { capture: true });
  }, [toggle]);

  return { terminalOpen, handleTerminalOpenChange: setOpen, toggle };
}
