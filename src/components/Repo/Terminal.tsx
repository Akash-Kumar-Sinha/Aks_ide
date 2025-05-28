import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  KeyRound,
  SquareChevronRight,
  Terminal as TerminalIcon,
  Play,
} from "lucide-react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { socket } from "@/utils/Socket";
import Loading from "@/components/Loading";
import useUserProfile from "@/utils/useUserProfile";
import { SaveStatus } from "@/pages/Playground";

interface TerminalProps {
  containerClassName?: string;
  openRepo: () => void;
  explorerloadingStatus: boolean;
  selectedFile?: string;
  saveStatus: SaveStatus;
}

const Terminal: React.FC<TerminalProps> = ({
  containerClassName = "",
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
      setConnected(true);
      if (user && !terminalLoaded) {
        socket.emit("load_terminal", { email: user.email });
        setTerminalLoaded(true);
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
      setTerminalActive(false);
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
    if (fitAddon.current && terminalInstance.current) {
      setTimeout(() => {
        try {
          fitAddon.current?.fit();
          const { rows, cols } = terminalInstance.current!;
          socket.emit("terminal_resize", { rows, cols, email: user?.email });
        } catch (err) {
          console.error("Error resizing terminal:", err);
        }
      }, 100);
    }
  }, [user]);

  const addMessage = useCallback(
    (
      type: "success" | "error" | "info" | "data" | "output",
      content: string
    ) => {
      if (terminalInstance.current && terminalActive) {
        let formattedContent = content;
        if (type === "error") {
          formattedContent = `\r\n\x1b[31mError: ${content}\x1b[0m\r\n`;
        } else if (type === "info") {
          formattedContent = `\r\n\x1b[33mInfo: ${content}\x1b[0m\r\n`;
        } else if (type === "success") {
          formattedContent = `\r\n\x1b[32mSuccess: ${content}\x1b[0m\r\n`;
        }

        if (typeof content === "string") {
          terminalInstance.current.write(formattedContent);
        } else {
          terminalInstance.current.write(new Uint8Array(content));
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
    [terminalActive]
  );

  useEffect(() => {
    const handleTerminalSuccess = (message?: string) => {
      console.log("Terminal success received", message);
      setTerminalActive(true);
      if (message) {
        addMessage("success", message);
      }
    };

    const handleTerminalError = (errorMsg: string) => {
      console.error("Terminal error:", errorMsg);
      addMessage("error", errorMsg);
    };

    const handleTerminalClosed = () => {
      console.log("Terminal closed received");
      setTerminalActive(false);
      setTerminalLoaded(false);
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
  }, [addMessage]);

  useEffect(() => {
    if (
      terminalActive &&
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

        if (typeof message.content === "string") {
          terminalInstance.current!.write(formattedContent);
        } else {
          terminalInstance.current!.write(new Uint8Array(message.content));
        }
      });

      setPendingMessages([]);
      setLoadingMessage("Terminal ready");
    }
  }, [terminalActive, pendingMessages]);

  useEffect(() => {
    if (
      !user ||
      !terminalRef.current ||
      terminalInstance.current ||
      !terminalActive
    )
      return;

    const terminal = new XTerminal({
      theme: {
        background: "#09090b",
        foreground: "#f4f4f5",
        cursor: "#9333ea",
        cursorAccent: "#18181b",
        black: "#27272a",
        red: "#ef4444",
        green: "#22c55e",
        yellow: "#eab308",
        blue: "#9333ea",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#f4f4f5",
        brightBlack: "#52525b",
        brightRed: "#f87171",
        brightGreen: "#4ade80",
        brightYellow: "#facc15",
        brightBlue: "#a855f7",
        brightMagenta: "#c084fc",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
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
      convertEol: false,
      disableStdin: false,
    });

    const fit = new FitAddon();
    terminal.loadAddon(fit);
    fitAddon.current = fit;

    terminal.open(terminalRef.current);
    terminal.focus();
    terminalInstance.current = terminal;

    handleResizeTerminal();
    window.addEventListener("resize", handleResizeTerminal);

    terminal.onData((data) => {
      if (!socket.connected || !terminalActive) return;

      socket.emit("terminal_input", {
        data: data,
        email: user?.email,
      });
    });

    return () => {
      window.removeEventListener("resize", handleResizeTerminal);
      terminal.dispose();
      terminalInstance.current = null;
      fitAddon.current = null;
    };
  }, [user, terminalActive, handleResizeTerminal]);

  const reloadTerminal = () => {
    if (!user || !socket.connected) return;

    if (terminalInstance.current) {
      terminalInstance.current.dispose();
      terminalInstance.current = null;
    }

    setTerminalActive(false);
    setTerminalLoaded(false);
    setPendingMessages([]);
    setLoadingMessage("Reloading terminal");
    socket.emit("close_terminal", { email: user.email });

    setTimeout(() => {
      socket.emit("load_terminal", { email: user.email });
      setTerminalLoaded(true);
    }, 500);
  };

  const clearTerminal = () => {
    if (terminalInstance.current) {
      terminalInstance.current.clear();
      socket.emit("terminal_input", {
        data: "clear\r",
        email: user?.email,
      });
    }
  };

  const SaveStatus = () => {
    if (saveStatus === "idle") return null;

    const statusConfig = {
      saving: { text: "•", color: "text-blue-400", animate: "animate-pulse" },
      saved: { text: "✓", color: "text-green-400", animate: "" },
      error: { text: "✗", color: "text-red-400", animate: "" },
    };

    const config = statusConfig[saveStatus];

    return (
      <div
        className={` ${config.color} ${config.animate} text-sm font-medium px-2 py-1 `}
      >
        {config.text}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900 
                   border border-zinc-800/50 rounded-lg w-full h-full min-h-96 shadow-xl ${containerClassName}`}
      >
        <Loading variant="pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 to-zinc-900 
                   border border-zinc-800/50 rounded-lg w-full h-full min-h-96 shadow-xl ${containerClassName}`}
      >
        <div className="text-center space-y-4 p-8">
          <div
            className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl 
                          flex items-center justify-center shadow-lg shadow-purple-600/25"
          >
            <KeyRound className="text-white w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              Authentication Required
            </h3>
            <p className="text-zinc-400 text-sm max-w-sm">
              Please sign in to access the terminal and start coding
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800/50 
                 rounded-lg w-full h-full min-h-96 shadow-xl overflow-hidden ${containerClassName}`}
    >
      <div
        className="flex items-center justify-between p-2 bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 
                      border-b border-zinc-700/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-purple-500" />
            <span className="text-zinc-200 font-medium text-sm">Terminal</span>
            <SaveStatus />
          </div>

          {selectedFile && (
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-zinc-500 rounded-full"></div>
              <span className="text-purple-400 text-xs font-mono bg-purple-500/10 px-2 py-1 rounded">
                {selectedFile.split("/").pop()}
              </span>
            </div>
          )}

          <div className="hidden md:block text-zinc-500 font-normal text-xs bg-zinc-800/50 px-2 py-1 rounded">
            💡 Use vim or nano to edit files
          </div>
        </div>

        <button
          onClick={openRepo}
          className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-600 to-purple-700 
                     hover:from-purple-500 hover:to-purple-600 text-white text-xs font-medium rounded-lg 
                     transition-all duration-200 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 
                     disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          disabled={explorerloadingStatus}
        >
          <Play className="w-3 h-3" />
          {explorerloadingStatus ? "Loading" : "Load Repository"}
        </button>
      </div>

      <div className="flex-1 bg-zinc-950 overflow-auto custom-scrollbar relative">
        <div
          ref={terminalRef}
          className="w-full h-full"
          style={{ minHeight: "200px" }}
        />

        {!terminalActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4 text-zinc-400 max-w-md mx-auto px-2">
              <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <TerminalIcon className="w-4 h-4 text-purple-500" />
              </div>
              <Loading loadingMessage={loadingMessage} variant="pulse" />

              {pendingMessages.length > 0 && (
                <div className="mt-4 space-y-2 w-full max-h-32 overflow-y-auto">
                  {pendingMessages.slice(-3).map((message, index) => (
                    <div
                      key={`${message.timestamp}-${index}`}
                      className={`text-xs p-2 rounded border-l-2 ${
                        message.type === "error"
                          ? "bg-red-950/30 border-red-500 text-red-300"
                          : message.type === "success"
                          ? "bg-green-950/30 border-green-500 text-green-300"
                          : "bg-yellow-950/30 border-yellow-500 text-yellow-300"
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
        )}
      </div>

      <div
        className="flex items-center justify-between p-2 bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 
                      border-t border-zinc-700/50 text-xs backdrop-blur-sm"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SquareChevronRight size={14} className="text-purple-500" />
            <span className="text-zinc-300 font-mono text-xs bg-zinc-800/50 px-2 py-1 rounded">
              {user.email}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={clearTerminal}
              disabled={!terminalActive}
              className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-md 
                         text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         hover:scale-105 active:scale-95"
              title="Clear Terminal"
            >
              Clear
            </button>
            <button
              onClick={reloadTerminal}
              disabled={!terminalActive}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-md 
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         hover:scale-105 active:scale-95"
              title="Reload Terminal"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleResizeTerminal}
              disabled={!terminalActive}
              className="px-3 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-md 
                         text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         hover:scale-105 active:scale-95"
              title="Resize Terminal"
            >
              Resize
            </button>
          </div>

          <div className="w-px h-4 bg-zinc-600"></div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  terminalActive
                    ? "bg-green-400 shadow-sm shadow-green-400/50"
                    : "bg-yellow-400 shadow-sm shadow-yellow-400/50"
                }`}
              ></div>
              <span className="text-zinc-400 text-xs">
                {terminalActive ? "Ready" : "Loading"}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  connected
                    ? "bg-green-400 shadow-sm shadow-green-400/50"
                    : "bg-red-400 shadow-sm shadow-red-400/50 animate-pulse"
                }`}
              ></div>
              <span className="text-zinc-400 text-xs">
                {connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
