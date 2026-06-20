"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import socket from "@/utils/Socket";
import useUserProfile from "@/utils/useUserProfile";
import type { Terminal as XTermTerminal } from "xterm";
import type { FitAddon } from "xterm-addon-fit";

export type TerminalTab = { id: string; label: string };

interface TerminalDataEvent { terminal_id: string; data: string }
interface TerminalStatusEvent { terminal_id: string; message: string }

const XTERM_THEME = {
  background: "#080808", foreground: "#e4e4e7", cursor: "#3b82f6", cursorAccent: "#080808",
  black: "#3f3f46", red: "#ef4444", green: "#22c55e", yellow: "#eab308",
  blue: "#3b82f6", magenta: "#a855f7", cyan: "#06b6d4", white: "#f4f4f5",
  brightBlack: "#52525b", brightRed: "#f87171", brightGreen: "#4ade80",
  brightYellow: "#fbbf24", brightBlue: "#60a5fa", brightMagenta: "#c084fc",
  brightCyan: "#22d3ee", brightWhite: "#ffffff",
};

let tabCounter = 1;

export function useTerminal() {
  const { userProfile: user, loading } = useUserProfile();

  const [connected, setConnected] = useState(false);
  const [terminalTabs, setTerminalTabs] = useState<TerminalTab[]>([{ id: "t1", label: "Terminal 1" }]);
  const [activeTerminalId, setActiveTerminalId] = useState("t1");
  const [tabReady, setTabReady] = useState<Record<string, boolean>>({});
  const [tabActive, setTabActive] = useState<Record<string, boolean>>({});
  const [tabLoadingMsg, setTabLoadingMsg] = useState<Record<string, string>>({ t1: "Initializing terminal" });
  const [pendingMessages, setPendingMessages] = useState<Record<string, Array<{ type: string; content: string; timestamp: number }>>>({});
  const [terminalLoaded, setTerminalLoaded] = useState<Set<string>>(new Set());

  const terminalInstances = useRef<Map<string, XTermTerminal>>(new Map());
  const fitAddons = useRef<Map<string, FitAddon>>(new Map());
  const terminalDivRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const initializedTabs = useRef<Set<string>>(new Set());

  const setTabMsg = (tabId: string, msg: string) =>
    setTabLoadingMsg((prev) => ({ ...prev, [tabId]: msg }));

  const writeToTab = useCallback((tabId: string, type: string, content: string) => {
    const instance = terminalInstances.current.get(tabId);
    const ready = tabReady[tabId] && tabActive[tabId];
    if (instance && ready) {
      let formatted = content;
      if (type === "error") formatted = `\r\n\x1b[31mError: ${content}\x1b[0m\r\n`;
      else if (type === "info") formatted = `\r\n\x1b[33mInfo: ${content}\x1b[0m\r\n`;
      else if (type === "success") formatted = `\r\n\x1b[32mSuccess: ${content}\x1b[0m\r\n`;
      try { instance.write(formatted); instance.scrollToBottom(); } catch {}
    } else {
      setPendingMessages((prev) => ({
        ...prev,
        [tabId]: [...(prev[tabId] ?? []), { type, content, timestamp: Date.now() }],
      }));
      if (type === "info") setTabMsg(tabId, content);
      else if (type === "error") setTabMsg(tabId, `Error: ${content}`);
      else if (type === "success") setTabMsg(tabId, `Success: ${content}`);
    }
  }, [tabReady, tabActive]);

  const initXterm = useCallback(async (tabId: string, el: HTMLDivElement) => {
    if (initializedTabs.current.has(tabId)) return;
    if (!user) return;
    initializedTabs.current.add(tabId);

    const [{ Terminal: XTerm }, { FitAddon }] = await Promise.all([
      import("xterm"),
      import("xterm-addon-fit"),
    ]);

    if (terminalInstances.current.has(tabId)) return;

    const terminal = new XTerm({
      theme: XTERM_THEME, fontSize: 13, fontFamily: "monospace", cursorBlink: true,
      cursorStyle: "block", scrollback: 5000, allowTransparency: false, lineHeight: 1.4,
      smoothScrollDuration: 150, convertEol: true, disableStdin: false, scrollOnUserInput: true,
    });

    const fit = new FitAddon();
    terminal.loadAddon(fit);

    try {
      terminal.open(el);
      terminal.focus();
      terminalInstances.current.set(tabId, terminal);
      fitAddons.current.set(tabId, fit);

      if (!document.querySelector("style[data-xterm-hide]")) {
        const style = document.createElement("style");
        style.setAttribute("data-xterm-hide", "");
        style.textContent = `.xterm-viewport::-webkit-scrollbar{width:0}.xterm-viewport{scrollbar-width:none;-ms-overflow-style:none}.xterm{height:100%!important}`;
        document.head.appendChild(style);
      }

      terminal.onData((data) => {
        if (!socket.connected || !user?.email) return;
        socket.emit("terminal_input", { data, email: user.email, terminalId: tabId });
        terminal.scrollToBottom();
      });

      setTimeout(() => {
        try { fit.fit(); } catch {}
        if (socket.connected && user?.email) {
          const { rows, cols } = terminal;
          socket.emit("terminal_resize", { rows, cols, email: user.email, terminalId: tabId });
        }
      }, 200);
    } catch (e) {
      console.error("xterm init failed for tab", tabId, e);
      initializedTabs.current.delete(tabId);
    }
  }, [user]);

  const registerDiv = useCallback((tabId: string) => (el: HTMLDivElement | null) => {
    if (el) {
      terminalDivRefs.current.set(tabId, el);
      if (user && !loading) initXterm(tabId, el);
    } else {
      terminalDivRefs.current.delete(tabId);
    }
  }, [user, loading, initXterm]);

  // Init xterm once user profile loads for already-mounted divs
  useEffect(() => {
    if (!user || loading) return;
    terminalDivRefs.current.forEach((el, tabId) => initXterm(tabId, el));
  }, [user, loading, initXterm]);

  // Socket connection
  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      if (user) {
        terminalTabs.forEach((tab) => {
          if (!terminalLoaded.has(tab.id)) {
            socket.emit("load_terminal", { email: user.email, terminalId: tab.id });
            setTerminalLoaded((prev) => new Set([...prev, tab.id]));
          }
        });
      }
    };
    const handleDisconnect = () => {
      setConnected(false);
      setTabReady({});
      setTabActive({});
    };
    if (socket.connected) handleConnect();
    else socket.connect();
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user, terminalTabs, terminalLoaded]);

  // Socket terminal events
  useEffect(() => {
    const onInfo = ({ terminal_id, message }: TerminalStatusEvent) => {
      setTabMsg(terminal_id, message);
      writeToTab(terminal_id, "info", message);
    };
    const onSuccess = ({ terminal_id, message }: TerminalStatusEvent) => {
      setTabActive((prev) => ({ ...prev, [terminal_id]: true }));
      setTabReady((prev) => ({ ...prev, [terminal_id]: true }));
      if (message) writeToTab(terminal_id, "success", message);
      setTimeout(() => {
        const fit = fitAddons.current.get(terminal_id);
        const inst = terminalInstances.current.get(terminal_id);
        if (fit && inst) {
          try { fit.fit(); } catch {}
          if (socket.connected && user?.email) {
            socket.emit("terminal_resize", { rows: inst.rows, cols: inst.cols, email: user.email, terminalId: terminal_id });
          }
        }
      }, 100);
    };
    const onLoading = ({ terminal_id, message }: TerminalStatusEvent) => setTabMsg(terminal_id, message);
    const onData = ({ terminal_id, data }: TerminalDataEvent) => writeToTab(terminal_id, "data", data);
    const onError = ({ terminal_id, message }: TerminalStatusEvent) => {
      writeToTab(terminal_id, "error", message);
      setTabReady((prev) => ({ ...prev, [terminal_id]: false }));
    };
    const onClosed = ({ terminal_id }: TerminalStatusEvent) => {
      setTabActive((prev) => ({ ...prev, [terminal_id]: false }));
      setTabReady((prev) => ({ ...prev, [terminal_id]: false }));
      setTerminalLoaded((prev) => { const next = new Set(prev); next.delete(terminal_id); return next; });
      setTabMsg(terminal_id, "Terminal closed");
      setPendingMessages((prev) => ({ ...prev, [terminal_id]: [] }));
    };
    const onClear = () => {
      terminalInstances.current.forEach((inst) => inst.clear());
      setPendingMessages({});
    };
    socket.on("terminal_info", onInfo);
    socket.on("terminal_success", onSuccess);
    socket.on("terminal_loading", onLoading);
    socket.on("terminal_data", onData);
    socket.on("terminal_error", onError);
    socket.on("terminal_closed", onClosed);
    socket.on("clear_terminal", onClear);
    return () => {
      socket.off("terminal_info", onInfo);
      socket.off("terminal_success", onSuccess);
      socket.off("terminal_loading", onLoading);
      socket.off("terminal_data", onData);
      socket.off("terminal_error", onError);
      socket.off("terminal_closed", onClosed);
      socket.off("clear_terminal", onClear);
    };
  }, [writeToTab, user]);

  // Flush pending messages once a tab becomes ready
  useEffect(() => {
    Object.entries(tabReady).forEach(([tabId, ready]) => {
      if (!ready || !tabActive[tabId]) return;
      const msgs = pendingMessages[tabId];
      if (!msgs?.length) return;
      const inst = terminalInstances.current.get(tabId);
      if (!inst) return;
      msgs.forEach((msg) => {
        let formatted = msg.content;
        if (msg.type === "error") formatted = `\r\n\x1b[31mError: ${msg.content}\x1b[0m\r\n`;
        else if (msg.type === "info") formatted = `\r\n\x1b[33mInfo: ${msg.content}\x1b[0m\r\n`;
        else if (msg.type === "success") formatted = `\r\n\x1b[32mSuccess: ${msg.content}\x1b[0m\r\n`;
        try { inst.write(formatted); } catch {}
      });
      inst.scrollToBottom();
      setPendingMessages((prev) => ({ ...prev, [tabId]: [] }));
      setTabMsg(tabId, "Terminal ready");
    });
  }, [tabReady, tabActive, pendingMessages]);

  // Window resize → refit all terminals
  useEffect(() => {
    const onResize = () => {
      fitAddons.current.forEach((fit, tabId) => {
        try {
          fit.fit();
          const inst = terminalInstances.current.get(tabId);
          if (inst && socket.connected && user?.email) {
            socket.emit("terminal_resize", { rows: inst.rows, cols: inst.cols, email: user.email, terminalId: tabId });
          }
        } catch {}
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [user]);

  // Focus + fit when switching active tab
  useLayoutEffect(() => {
    const fit = fitAddons.current.get(activeTerminalId);
    const inst = terminalInstances.current.get(activeTerminalId);
    if (fit && inst) {
      try { fit.fit(); inst.focus(); } catch {}
    }
  }, [activeTerminalId]);

  const addTerminalTab = () => {
    tabCounter += 1;
    const id = `t${tabCounter}`;
    setTerminalTabs((prev) => [...prev, { id, label: `Terminal ${tabCounter}` }]);
    setTabMsg(id, "Initializing terminal");
    setActiveTerminalId(id);
    if (user && socket.connected) {
      socket.emit("load_terminal", { email: user.email, terminalId: id });
      setTerminalLoaded((prev) => new Set([...prev, id]));
    }
  };

  const closeTerminalTab = (id: string) => {
    if (user && socket.connected) socket.emit("close_terminal", { email: user.email, terminalId: id });
    terminalInstances.current.get(id)?.dispose();
    terminalInstances.current.delete(id);
    fitAddons.current.delete(id);
    initializedTabs.current.delete(id);
    setTerminalTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      const fallback = next.length === 0 ? [{ id: "t1", label: "Terminal 1" }] : next;
      if (activeTerminalId === id) setActiveTerminalId(fallback[0].id);
      return fallback;
    });
  };

  const reloadTerminal = () => {
    if (!user || !socket.connected) return;
    const tabId = activeTerminalId;
    terminalInstances.current.get(tabId)?.clear();
    setTabActive((prev) => ({ ...prev, [tabId]: false }));
    setTabReady((prev) => ({ ...prev, [tabId]: false }));
    setTerminalLoaded((prev) => { const next = new Set(prev); next.delete(tabId); return next; });
    setTabMsg(tabId, "Reloading terminal");
    socket.emit("close_terminal", { email: user.email, terminalId: tabId });
    setTimeout(() => {
      socket.emit("load_terminal", { email: user.email, terminalId: tabId });
      setTerminalLoaded((prev) => new Set([...prev, tabId]));
    }, 1000);
  };

  const clearTerminal = () => {
    const inst = terminalInstances.current.get(activeTerminalId);
    if (inst && tabActive[activeTerminalId]) {
      inst.clear();
      if (socket.connected && user?.email) {
        socket.emit("terminal_input", { data: "clear\r", email: user.email, terminalId: activeTerminalId });
      }
    }
  };

  return {
    user, loading, connected,
    terminalTabs, activeTerminalId, setActiveTerminalId,
    tabReady, tabActive, tabLoadingMsg, pendingMessages,
    registerDiv,
    addTerminalTab, closeTerminalTab, reloadTerminal, clearTerminal,
  };
}
