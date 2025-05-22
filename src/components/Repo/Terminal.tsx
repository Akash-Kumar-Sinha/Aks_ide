import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, KeyRound, SquareChevronRight } from "lucide-react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { socket } from "@/utils/Socket";
import Loading from "@/utils/Loading";
import useUserProfile from "@/utils/useUserProfile";

interface TerminalProps {
  containerClassName?: string;
}

const Terminal: React.FC<TerminalProps> = ({ containerClassName = "" }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<XTerminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);

  const { userProfile: user, loading } = useUserProfile();
  const [connected, setConnected] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);
  const [terminalLoaded, setTerminalLoaded] = useState(false);

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

  useEffect(() => {
    const handleTerminalSuccess = () => setTerminalActive(true);
    const handleTerminalError = (errorMsg: string) => {
      console.error("Terminal error:", errorMsg);
      if (terminalInstance.current) {
        terminalInstance.current.write(
          `\r\n\x1b[31mError: ${errorMsg}\x1b[0m\r\n`
        );
      }
    };
    const handleTerminalClosed = () => {
      setTerminalActive(false);
      setTerminalLoaded(false);
    };

    socket.on("terminal_success", handleTerminalSuccess);
    socket.on("terminal_error", handleTerminalError);
    socket.on("terminal_closed", handleTerminalClosed);

    return () => {
      socket.off("terminal_success", handleTerminalSuccess);
      socket.off("terminal_error", handleTerminalError);
      socket.off("terminal_closed", handleTerminalClosed);
    };
  }, []);

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
        background: "#0a0b0d",
        foreground: "#e6e8eb",
        cursor: "#9333ea",
        cursorAccent: "#1f2937",
        black: "#374151",
        red: "#ef4444",
        green: "#10b981",
        yellow: "#f59e0b",
        blue: "#9333ea",
        magenta: "#8b5cf6",
        cyan: "#06b6d4",
        white: "#f3f4f6",
        brightBlack: "#6b7280",
        brightRed: "#f87171",
        brightGreen: "#34d399",
        brightYellow: "#fbbf24",
        brightBlue: "#a855f7",
        brightMagenta: "#a78bfa",
        brightCyan: "#22d3ee",
        brightWhite: "#ffffff",
      },
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 5000,
      allowTransparency: false,
      lineHeight: 1.3,
      smoothScrollDuration: 200,
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

    const handleTerminalData = (data: string | Uint8Array) => {
      if (terminalInstance.current) {
        if (typeof data === "string") {
          terminalInstance.current.write(data);
        } else {
          terminalInstance.current.write(new Uint8Array(data));
        }
      }
    };

    const handleTerminalOutput = (data: string) => {
      if (terminalInstance.current) {
        terminalInstance.current.write(data);
      }
    };

    const handleClearTerminal = () => {
      if (terminalInstance.current) {
        terminalInstance.current.clear();
      }
    };

    socket.on("terminal_data", handleTerminalData);
    socket.on("terminal_output", handleTerminalOutput);
    socket.on("clear_terminal", handleClearTerminal);

    return () => {
      socket.off("terminal_data", handleTerminalData);
      socket.off("terminal_output", handleTerminalOutput);
      socket.off("clear_terminal", handleClearTerminal);
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

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900 rounded-xl shadow-2xl border border-gray-800/50 w-full h-full min-h-96 ${containerClassName}`}
      >
        <Loading />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900 rounded-xl shadow-2xl border border-gray-800/50 w-full h-full min-h-96 ${containerClassName}`}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg shadow-purple-600/25">
            <KeyRound className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-100 mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-400">
              Please sign in to access the terminal
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-gradient-to-br from-gray-950 via-slate-950 to-gray-900 rounded-lg shadow-2xl border border-gray-800/50 backdrop-blur-sm w-full h-full min-h-96 ${containerClassName}`}
    >
      <div className="flex items-center justify-between px-4 py-1.5 bg-gradient-to-r from-gray-900/80 to-slate-900/80 backdrop-blur-sm border-b border-gray-700/50 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <span className="text-gray-300 font-medium text-sm ml-2">
            Terminal
          </span>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-br from-gray-950 to-slate-950 overflow-hidden relative">
        <div
          ref={terminalRef}
          className="w-full h-full"
          style={{ minHeight: "200px" }}
        />

        {!terminalActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 text-gray-400">
              {/* <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Initializing terminal...</span> */}
              <Loading loadingMessage="Initializing terminal..." />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-1 bg-gradient-to-r from-gray-900/80 to-slate-900/80 backdrop-blur-sm text-xs rounded-b-xl border-t border-gray-700/50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SquareChevronRight size={14} className="text-purple-600" />
            <span className="text-gray-300 font-mono">{user.email}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={clearTerminal}
              disabled={!terminalActive}
              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-gray-800/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              title="Clear Terminal"
            >
              Clear
            </button>
            <button
              onClick={reloadTerminal}
              disabled={!connected}
              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-gray-800/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Reload Terminal"
            >
              <RefreshCw size={14} />
            </button>
            <button
              onClick={handleResizeTerminal}
              disabled={!terminalActive}
              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-gray-800/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Resize Terminal"
            >
              Resize
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                terminalActive
                  ? "bg-green-400 shadow-green-400/50"
                  : "bg-yellow-400 shadow-yellow-400/50"
              } shadow-sm animate-pulse`}
            ></div>
            <span className="text-gray-400">
              {terminalActive ? "Ready" : "Loading"}
            </span>
          </div>
          <div className="w-px h-4 bg-gray-700"></div>

          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected
                  ? "bg-green-400 shadow-green-400/50"
                  : "bg-red-400 shadow-red-400/50"
              } shadow-sm`}
            ></div>
            <span className="text-gray-400">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;
