import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  KeyRound,
  Terminal as TerminalIcon,
  Play,
} from "lucide-react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

import { Loading } from "../ui/Loading/Loading";
import type { SaveStatus } from "../../pages/Playground";
import useUserProfile from "../../utils/useUserProfile";
import socket from "../../utils/Socket";
import { Button } from "../ui/button";

interface TerminalProps {
  openRepo: () => void;
  explorerloadingStatus: boolean;
  selectedFile?: string;
  saveStatus: SaveStatus;
}

const Terminal: React.FC<TerminalProps> = ({
  openRepo,
  explorerloadingStatus,
  selectedFile,
  saveStatus,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<XTerminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const { userProfile: user, loading } = useUserProfile();
  const [connected, setConnected] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);
  const [terminalLoaded, setTerminalLoaded] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);

  const [pendingMessages, setPendingMessages] = useState<
    Array<{
      type: "success" | "error" | "info" | "data" | "output";
      content: string;
      timestamp: number;
    }>
  >([]);
  const [loadingMessage, setLoadingMessage] = useState("Initializing terminal");

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected");
      setConnected(true);
      if (user && !terminalLoaded) {
        socket.emit("load_terminal", { email: user.email });
        setTerminalLoaded(true);
      }
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setConnected(false);
      setTerminalActive(false);
      setTerminalReady(false);
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user, terminalLoaded]);

  const handleResizeTerminal = useCallback(() => {
    if (fitAddon.current && terminalInstance.current && terminalActive) {
      try {
        setTimeout(() => {
          if (fitAddon.current && terminalInstance.current) {
            fitAddon.current.fit();
            const { rows, cols } = terminalInstance.current;
            console.log(`Terminal resized to ${cols}x${rows}`);

            if (socket.connected && user?.email) {
              socket.emit("terminal_resize", { rows, cols, email: user.email });
            }
          }
        }, 50);
      } catch (err) {
        console.error("Error resizing terminal:", err);
      }
    }
  }, [user, terminalActive]);

  const addMessage = useCallback(
    (
      type: "success" | "error" | "info" | "data" | "output",
      content: string
    ) => {
      if (terminalInstance.current && terminalActive && terminalReady) {
        let formattedContent = content;
        if (type === "error") {
          formattedContent = `\r\n\x1b[31mError: ${content}\x1b[0m\r\n`;
        } else if (type === "info") {
          formattedContent = `\r\n\x1b[33mInfo: ${content}\x1b[0m\r\n`;
        } else if (type === "success") {
          formattedContent = `\r\n\x1b[32mSuccess: ${content}\x1b[0m\r\n`;
        }

        try {
          if (typeof content === "string") {
            terminalInstance.current.write(formattedContent);
          } else {
            terminalInstance.current.write(new Uint8Array(content));
          }
        } catch (error) {
          console.error("Error writing to terminal:", error);
        }
      } else {
        const message = {
          type,
          content,
          timestamp: Date.now(),
        };

        setPendingMessages((prev) => [...prev, message]);

        if (type === "info") {
          setLoadingMessage(content);
        } else if (type === "error") {
          setLoadingMessage(`Error: ${content}`);
        } else if (type === "success") {
          setLoadingMessage(`Success: ${content}`);
        }
      }
    },
    [terminalActive, terminalReady]
  );

  useEffect(() => {
    const handleTerminalSuccess = (message?: string) => {
      console.log("Terminal success received", message);
      setTerminalActive(true);
      setTerminalReady(true);
      if (message) {
        addMessage("success", message);
      }
      setTimeout(() => handleResizeTerminal(), 100);
    };

    const handleTerminalError = (errorMsg: string) => {
      console.error("Terminal error:", errorMsg);
      addMessage("error", errorMsg);
      setTerminalReady(false);
    };

    const handleTerminalClosed = () => {
      console.log("Terminal closed received");
      setTerminalActive(false);
      setTerminalLoaded(false);
      setTerminalReady(false);
      setPendingMessages([]);
      setLoadingMessage("Terminal closed");
    };

    const handleTerminalInfo = (info: string) => {
      console.log("Terminal info received:", info);
      addMessage("info", info);
    };

    const handleTerminalData = (data: string | Uint8Array) => {
      addMessage("data", data as string);
    };

    const handleTerminalOutput = (data: string) => {
      addMessage("output", data);
    };

    const handleClearTerminal = () => {
      if (terminalInstance.current) {
        terminalInstance.current.clear();
      }
      setPendingMessages([]);
    };

    socket.on("terminal_success", handleTerminalSuccess);
    socket.on("terminal_error", handleTerminalError);
    socket.on("terminal_closed", handleTerminalClosed);
    socket.on("terminal_info", handleTerminalInfo);
    socket.on("terminal_data", handleTerminalData);
    socket.on("terminal_output", handleTerminalOutput);
    socket.on("clear_terminal", handleClearTerminal);

    return () => {
      socket.off("terminal_success", handleTerminalSuccess);
      socket.off("terminal_error", handleTerminalError);
      socket.off("terminal_closed", handleTerminalClosed);
      socket.off("terminal_info", handleTerminalInfo);
      socket.off("terminal_data", handleTerminalData);
      socket.off("terminal_output", handleTerminalOutput);
      socket.off("clear_terminal", handleClearTerminal);
    };
  }, [addMessage, handleResizeTerminal]);

  useEffect(() => {
    if (
      terminalActive &&
      terminalReady &&
      terminalInstance.current &&
      pendingMessages.length > 0
    ) {
      pendingMessages.forEach((message) => {
        let formattedContent = message.content;
        if (message.type === "error") {
          formattedContent = `\r\n\x1b[31mError: ${message.content}\x1b[0m\r\n`;
        } else if (message.type === "info") {
          formattedContent = `\r\n\x1b[33mInfo: ${message.content}\x1b[0m\r\n`;
        } else if (message.type === "success") {
          formattedContent = `\r\n\x1b[32mSuccess: ${message.content}\x1b[0m\r\n`;
        }

        try {
          if (typeof message.content === "string") {
            terminalInstance.current!.write(formattedContent);
          } else {
            terminalInstance.current!.write(new Uint8Array(message.content));
          }
        } catch (error) {
          console.error("Error writing pending message:", error);
        }
      });

      setPendingMessages([]);
      setLoadingMessage("Terminal ready");
    }
  }, [terminalActive, terminalReady, pendingMessages]);

  useEffect(() => {
    if (!user || !terminalRef.current || terminalInstance.current) return;

    console.log("Initializing terminal for user:", user.email);

    const terminal = new XTerminal({
      theme: {
        background: "#000000",
        foreground: "#ffffff",
        cursor: "#3b82f6",
        cursorAccent: "#ffffff",
        black: "#9ca3af",
        red: "#ef4444",
        green: "#10b981",
        yellow: "#f59e0b",
        blue: "#60a5fa",
        magenta: "#8b5cf6",
        cyan: "#06b6d4",
        white: "#f1f5f9",
        brightBlack: "#6b7280",
        brightRed: "#ef4444",
        brightGreen: "#10b981",
        brightYellow: "#f59e0b",
        brightBlue: "#60a5fa",
        brightMagenta: "#8b5cf6",
        brightCyan: "#06b6d4",
        brightWhite: "#f1f5f9",
      },
      fontSize: 13,
      fontFamily:
        "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace",
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 5000,
      allowTransparency: false,
      lineHeight: 1.2,
      smoothScrollDuration: 150,
      convertEol: true,
      disableStdin: false,
    });

    const fit = new FitAddon();
    terminal.loadAddon(fit);
    fitAddon.current = fit;

    try {
      terminal.open(terminalRef.current);
      terminal.focus();
      terminalInstance.current = terminal;

      console.log("Terminal opened successfully");

      terminal.onData((data) => {
        console.log("Terminal input received:", data);

        if (!socket.connected) {
          console.warn("Socket not connected, cannot send input");
          return;
        }

        if (!terminalInstance.current) {
          console.warn("Terminal not active, cannot send input");
          return;
        }

        if (!user?.email) {
          console.warn("No user email, cannot send input");
          return;
        }

        socket.emit("terminal_input", {
          data: data,
          email: user.email,
        });
      });

      terminal.onSelectionChange(() => {
        const selection = terminal.getSelection();
        if (selection) {
          console.log("Text selected:", selection);
        }
      });

      setTimeout(() => {
        handleResizeTerminal();
      }, 200);

      console.log("Terminal initialization complete");
    } catch (error) {
      console.error("Error initializing terminal:", error);
    }

    return () => {
      console.log("Terminal component unmounting");
    };
  }, [user, handleResizeTerminal, terminalActive]);

  useEffect(() => {
    if (terminalInstance.current && terminalActive) {
      const timeoutId = setTimeout(() => {
        handleResizeTerminal();
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [handleResizeTerminal, terminalActive]);

  useEffect(() => {
    const handleWindowResize = () => {
      console.log("Window resized, adjusting terminal");
      handleResizeTerminal();
    };

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleResizeTerminal]);

  const reloadTerminal = () => {
    if (!user || !socket.connected) return;

    console.log("Reloading terminal");

    if (terminalInstance.current) {
      terminalInstance.current.dispose();
      terminalInstance.current = null;
      fitAddon.current = null;
    }

    setTerminalActive(false);
    setTerminalLoaded(false);
    setTerminalReady(false);
    setPendingMessages([]);
    setLoadingMessage("Reloading terminal");

    socket.emit("close_terminal", { email: user.email });

    setTimeout(() => {
      socket.emit("load_terminal", { email: user.email });
      setTerminalLoaded(true);
    }, 1000);
  };

  const clearTerminal = () => {
    if (terminalInstance.current && terminalActive) {
      terminalInstance.current.clear();
      if (socket.connected && user?.email) {
        socket.emit("terminal_input", {
          data: "clear\r",
          email: user.email,
        });
      }
    }
  };

  const SaveStatusComponent = () => {
    if (saveStatus === "idle") return null;

    const statusConfig = {
      saving: {
        text: "Saving",
        className: "bg-[#1a1a1a] text-[#569cd6]",
        animate: true,
      },
      saved: {
        text: "Saved",
        className: "bg-[#1a1a1a] text-[#4ec9b0]",
        animate: false,
      },
      error: {
        text: "Error",
        className: "bg-[#1a1a1a] text-[#f14c4c]",
        animate: false,
      },
    };

    const config = statusConfig[saveStatus];

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${config.className} ${
          config.animate ? "animate-pulse" : ""
        }`}
      >
        {config.text}
      </span>
    );
  };

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
            terminalActive && terminalReady
              ? "bg-green-500 shadow-green-500/50"
              : terminalActive
              ? "bg-yellow-500 shadow-yellow-500/50"
              : "bg-red-500 shadow-red-500/50"
          }`}
          style={{
            boxShadow: `0 0 4px currentColor`,
          }}
        />
        <span className="text-xs text-[#808080]">
          {terminalActive && terminalReady
            ? "Ready"
            : terminalActive
            ? "Starting"
            : "Offline"}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
            !connected ? "animate-pulse" : ""
          } ${
            connected
              ? "bg-green-500 shadow-green-500/50"
              : "bg-red-500 shadow-red-500/50"
          }`}
          style={{
            boxShadow: `0 0 4px currentColor`,
          }}
        />
        <span className="text-xs text-[#808080]">
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );

  const TerminalHeader = () => (
    <div className="border-b border-[#1a1a1a] bg-[#000000] p-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <TerminalIcon className="w-4 h-4 shrink-0 text-[#569cd6]" />
          <h3 className="text-sm font-medium text-[#cccccc]">Terminal</h3>
          {selectedFile && (
            <span
              className="px-2 py-1 text-xs rounded-sm bg-[#1a1a1a] text-[#569cd6] truncate max-w-full"
              title={selectedFile}
            >
              📁 {selectedFile.split("/").pop()}
            </span>
          )}

          <SaveStatusComponent />
          <div className="hidden sm:block">
            <ConnectionStatus />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="block sm:hidden">
            <ConnectionStatus />
          </div>

          <div className="flex items-center gap-1">
            <Button
              onClick={clearTerminal}
              disabled={!terminalActive || !terminalReady}
              className="px-2 py-1 text-xs text-[#808080] hover:text-[#cccccc] bg-transparent hover:bg-[#1a1a1a]"
              variant="ghost"
              title="Clear Terminal"
            >
              <span className="hidden sm:inline">Clear</span>
              <span className="sm:hidden">C</span>
            </Button>

            <Button
              onClick={reloadTerminal}
              disabled={!connected}
              className="p-1 text-gray-500 hover:text-gray-700"
              variant="ghost"
              title="Reload Terminal"
            >
              <RefreshCw size={12} />
            </Button>
          </div>

          <Button
            onClick={openRepo}
            className="flex items-center gap-2 px-2 sm:px-3 py-1.5 text-sm"
            disabled={explorerloadingStatus}
            variant="default"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">
              {explorerloadingStatus ? "Loading..." : "Load Repo"}
            </span>
            <span className="sm:hidden">
              {explorerloadingStatus ? "Load..." : "Load"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
  const LoadingCard = () => (
    <div className="max-h-full overflow-y-auto bg-[#000000] border border-[#1a1a1a] rounded-lg">
      <TerminalHeader />
      <div className="flex flex-col items-center justify-center h-full bg-[#000000] p-6">
        <div className="flex flex-col items-center space-y-4 max-w-md mx-auto px-4 text-[#808080]">
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#1a1a1a]">
            <TerminalIcon className="w-4 h-4 text-[#569cd6]" />
          </div>
          <Loading
            variant="default"
            scale="lg"
            pattern="pulse"
            loadingMessage={loadingMessage}
          />

          <div className="text-xs text-center text-[#808080]">
            Connected: {connected ? "✓" : "✗"} | Active:{" "}
            {terminalActive ? "✓" : "✗"} | Ready: {terminalReady ? "✓" : "✗"}
          </div>

          {pendingMessages.length > 0 && (
            <div className="mt-4 space-y-2 w-full max-h-32 overflow-y-auto">
              {pendingMessages.slice(-3).map((message, index) => (
                <div
                  key={`${message.timestamp}-${index}`}
                  className={`text-xs p-2 rounded border-l-2 ${
                    message.type === "error"
                      ? "bg-[#1a1a1a] border-l-[#f14c4c] text-[#f14c4c]"
                      : message.type === "success"
                      ? "bg-[#1a1a1a] border-l-[#4ec9b0] text-[#4ec9b0]"
                      : "bg-[#1a1a1a] border-l-[#ce9178] text-[#ce9178]"
                  }`}
                >
                  <span className="font-medium capitalize">
                    {message.type}:
                  </span>{" "}
                  {message.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Loading state while fetching user profile
  if (loading) {
    return (
      <div className="max-h-full overflow-y-auto bg-[#000000] border border-[#1a1a1a] rounded-lg">
        <div className="border-b border-[#1a1a1a] p-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-[#569cd6]" />
            <h3 className="text-sm font-medium text-[#cccccc]">Terminal</h3>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#1a1a1a]">
              <KeyRound className="w-4 h-4 text-[#569cd6]" />
            </div>
            <Loading
              variant="default"
              scale="lg"
              pattern="pulse"
              loadingMessage="Loading user profile..."
            />
            <p className="text-sm text-[#808080]">
              Please wait while we initialize your workspace
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No user authenticated
  if (!user) {
    return (
      <div className="h-full bg-[#000000] border border-[#1a1a1a] rounded-lg">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center space-y-4 p-8">
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-[#569cd6]">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl mb-2 text-[#cccccc]">
                Authentication Required
              </h3>
              <p className="max-w-sm text-[#808080]">
                Please sign in to access the terminal and start coding
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (terminalActive && terminalReady) {
    return (
      <div className="bg-[#000000] border border-[#1a1a1a] rounded-lg">
        <TerminalHeader />
        <div className="bg-[#000000] px-1">
          <div ref={terminalRef} className="w-full h-full bg-[#000000]" />
        </div>
      </div>
    );
  }

  return <LoadingCard />;
};

export default Terminal;
