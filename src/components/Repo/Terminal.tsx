import React, { useEffect, useRef, useState } from "react";
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

// Define control character constants for better readability
const CONTROL_CHARS = {
  ENTER: 13,        // Carriage Return (CR)
  BACKSPACE: 8,     // Backspace (BS)
  DELETE: 127,      // Delete (DEL)
  TAB: 9,          // Horizontal Tab
  ESC: 27,         // Escape
  SPACE: 32,       // Space (start of printable characters)
  CTRL_C: 3,       // Ctrl+C (SIGINT)
  CTRL_D: 4,       // Ctrl+D (EOF/SIGTERM)
  CTRL_L: 12,      // Ctrl+L (clear screen)
  CTRL_Z: 26,      // Ctrl+Z (SIGTSTP - suspend process)
  LINE_FEED: 10,   // Line Feed (LF)
  VERTICAL_TAB: 11, // Vertical Tab
} as const;

const Terminal: React.FC<TerminalProps> = ({ containerClassName = "" }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<XTerminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const currentCommand = useRef<string>("");
  const commandHistory = useRef<string[]>([]);
  const historyPosition = useRef<number>(0);
  const cursorPosition = useRef<number>(0);

  const { userProfile: user, loading } = useUserProfile();
  const [connected, setConnected] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);
  const [terminalLoaded, setTerminalLoaded] = useState(false);

  // Basic command completion suggestions
  const commonCommands = [
    'ls', 'cd', 'pwd', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'cat', 'grep',
    'find', 'chmod', 'chown', 'ps', 'kill', 'top', 'htop', 'df', 'du',
    'wget', 'curl', 'git', 'npm', 'node', 'python', 'pip', 'docker',
    'clear', 'history', 'echo', 'nano', 'vim', 'emacs'
  ];

  // Tab completion function
  const handleTabCompletion = () => {
    const terminal = terminalInstance.current;
    if (!terminal) return;

    const currentCmd = currentCommand.current.trim();
    if (!currentCmd) return;

    // Simple completion for commands
    const words = currentCmd.split(' ');
    const lastWord = words[words.length - 1];
    
    if (words.length === 1) {
      // Complete command names
      const matches = commonCommands.filter(cmd => 
        cmd.startsWith(lastWord.toLowerCase())
      );
      
      if (matches.length === 1) {
        // Single match - complete it
        const completion = matches[0].substring(lastWord.length);
        currentCommand.current += completion + ' ';
        terminal.write(completion + ' ');
        cursorPosition.current = currentCommand.current.length;
      } else if (matches.length > 1) {
        // Multiple matches - show them
        terminal.write('\r\n');
        const maxLength = Math.max(...matches.map(m => m.length));
        const columns = Math.floor(80 / (maxLength + 2));
        
        for (let i = 0; i < matches.length; i += columns) {
          const row = matches.slice(i, i + columns);
          const formattedRow = row.map(cmd => cmd.padEnd(maxLength + 2)).join('');
          terminal.write(formattedRow + '\r\n');
        }
        
        // Redraw current command
        terminal.write('\r\n' + currentCommand.current);
      }
    }
  };

  // Socket connection management
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

  // Terminal event handlers
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

    // Handle process interruption/termination responses
    const handleProcessInterrupted = () => {
      if (terminalInstance.current) {
        // Clear current command after successful interrupt
        currentCommand.current = "";
        historyPosition.current = 0;
        cursorPosition.current = 0;
        terminalInstance.current.write('\r\n');
      }
    };

    const handleProcessSuspended = () => {
      if (terminalInstance.current) {
        terminalInstance.current.write('\r\n[Process suspended]\r\n');
      }
    };

    const handleSignalError = (error: string) => {
      if (terminalInstance.current) {
        terminalInstance.current.write(`\r\n\x1b[33mSignal error: ${error}\x1b[0m\r\n`);
      }
    };

    socket.on("terminal_success", handleTerminalSuccess);
    socket.on("terminal_error", handleTerminalError);
    socket.on("terminal_closed", handleTerminalClosed);
    socket.on("process_interrupted", handleProcessInterrupted);
    socket.on("process_suspended", handleProcessSuspended);
    socket.on("signal_error", handleSignalError);

    return () => {
      socket.off("terminal_success", handleTerminalSuccess);
      socket.off("terminal_error", handleTerminalError);
      socket.off("terminal_closed", handleTerminalClosed);
      socket.off("process_interrupted", handleProcessInterrupted);
      socket.off("process_suspended", handleProcessSuspended);
      socket.off("signal_error", handleSignalError);
    };
  }, []);

  // Terminal initialization
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
    });

    const fit = new FitAddon();
    terminal.loadAddon(fit);
    fitAddon.current = fit;

    terminal.open(terminalRef.current);
    terminal.focus();
    terminalInstance.current = terminal;

    // Reset command state
    currentCommand.current = "";
    commandHistory.current = [];
    historyPosition.current = 0;
    cursorPosition.current = 0;

    // Fit terminal and handle resize
    const handleResize = () => {
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
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Handle terminal input with proper command building
    terminal.onData((data) => {
      if (!socket.connected || !terminalActive) return;

      // Handle different types of input
      for (let i = 0; i < data.length; i++) {
        const char = data[i];
        const charCode = char.charCodeAt(0);

        switch (charCode) {
          case CONTROL_CHARS.ENTER:
          case CONTROL_CHARS.LINE_FEED:
            // Handle Enter/Return
            terminal.write('\r\n');
            if (currentCommand.current.trim()) {
              // Add to history if it's different from the last command
              const lastCommand = commandHistory.current[commandHistory.current.length - 1];
              if (lastCommand !== currentCommand.current) {
                commandHistory.current.push(currentCommand.current);
                // Limit history to 1000 commands
                if (commandHistory.current.length > 1000) {
                  commandHistory.current = commandHistory.current.slice(-1000);
                }
              }
              // Send command to server
              socket.emit("terminal_write", {
                command: currentCommand.current,
                email: user?.email,
              });
            }
            currentCommand.current = "";
            historyPosition.current = 0;
            cursorPosition.current = 0;
            break;

          case CONTROL_CHARS.BACKSPACE:
          case CONTROL_CHARS.DELETE:
            // Handle Backspace/Delete
            if (currentCommand.current.length > 0) {
              currentCommand.current = currentCommand.current.slice(0, -1);
              cursorPosition.current = Math.max(0, cursorPosition.current - 1);
              terminal.write('\b \b');
            }
            break;

          case CONTROL_CHARS.TAB:
            // Handle Tab completion
            handleTabCompletion();
            break;

          case CONTROL_CHARS.CTRL_C:
            // Handle Ctrl+C - Send SIGINT to interrupt running processes
            terminal.write('^C');
            // Don't clear the command immediately, let the server handle the interrupt
            // The server should send the interrupt signal to the running process
            socket.emit("terminal_interrupt", { 
              email: user?.email,
              signal: 'SIGINT'
            });
            break;

          case CONTROL_CHARS.CTRL_D:
            // Handle Ctrl+D (EOF) - Send SIGTERM for graceful termination
            if (currentCommand.current.length === 0) {
              socket.emit("terminal_signal", { 
                email: user?.email,
                signal: 'SIGTERM'
              });
            } else {
              // If there's text, just delete the character under cursor
              terminal.write('\x04');
            }
            break;

          case CONTROL_CHARS.CTRL_L:
            // Handle Ctrl+L (clear screen)
            terminal.clear();
            break;

          case CONTROL_CHARS.CTRL_Z:
            // Handle Ctrl+Z - Send SIGTSTP to suspend process
            terminal.write('^Z');
            socket.emit("terminal_signal", { 
              email: user?.email,
              signal: 'SIGTSTP'
            });
            break;

          case CONTROL_CHARS.ESC:
            // Handle ESC sequence (arrow keys, etc.)
            if (i + 2 < data.length && data[i + 1] === '[') {
              const escapeCode = data[i + 2];
              switch (escapeCode) {
                case 'A': // Up arrow
                  if (commandHistory.current.length > 0 && historyPosition.current < commandHistory.current.length) {
                    historyPosition.current++;
                    const historyCommand = commandHistory.current[commandHistory.current.length - historyPosition.current];
                    // Clear current line and write history command
                    terminal.write('\x1b[2K\r' + historyCommand);
                    currentCommand.current = historyCommand;
                    cursorPosition.current = historyCommand.length;
                  }
                  break;
                  
                case 'B': // Down arrow
                  if (historyPosition.current > 0) {
                    historyPosition.current--;
                    const nextCommand = historyPosition.current === 0 
                      ? "" 
                      : commandHistory.current[commandHistory.current.length - historyPosition.current];
                    // Clear current line and write next command
                    terminal.write('\x1b[2K\r' + nextCommand);
                    currentCommand.current = nextCommand;
                    cursorPosition.current = nextCommand.length;
                  }
                  break;
                  
                case 'C': // Right arrow
                case 'D': // Left arrow
                  // For now, just pass through arrow keys
                  // Future enhancement: implement cursor movement within command
                  terminal.write(char);
                  if (i + 1 < data.length) terminal.write(data[i + 1]);
                  if (i + 2 < data.length) terminal.write(data[i + 2]);
                  break;
                  
                default:
                  // Other escape sequences, pass them through
                  terminal.write(char);
                  if (i + 1 < data.length) terminal.write(data[i + 1]);
                  if (i + 2 < data.length) terminal.write(data[i + 2]);
                  break;
              }
              i += 2; // Skip the next two characters
            } else {
              terminal.write(char);
            }
            break;

          default:
            // Handle regular printable characters and other control characters
            if (charCode >= CONTROL_CHARS.SPACE || charCode === CONTROL_CHARS.TAB) {
              // Printable characters and tab
              currentCommand.current += char;
              cursorPosition.current++;
              terminal.write(char);
            } else if (charCode === CONTROL_CHARS.VERTICAL_TAB) {
              // Handle vertical tab
              terminal.write(char);
            } else {
              // Other control characters, pass them through but don't add to command
              terminal.write(char);
            }
            break;
        }
      }
    });

    // Handle terminal data from server
    const handleTerminalData = (data: string) => {
      if (terminalInstance.current && typeof data === "string") {
        terminalInstance.current.write(data);
      }
    };

    socket.on("terminal_data", handleTerminalData);

    return () => {
      socket.off("terminal_data", handleTerminalData);
      window.removeEventListener("resize", handleResize);
      terminal.dispose();
      terminalInstance.current = null;
      fitAddon.current = null;
    };
  }, [user, terminalActive]);

  const reloadTerminal = () => {
    if (!user || !socket.connected) return;

    if (terminalInstance.current) {
      terminalInstance.current.dispose();
      terminalInstance.current = null;
    }

    setTerminalActive(false);
    setTerminalLoaded(false);
    socket.emit("load_terminal", { email: user.email });
    setTerminalLoaded(true);
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
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Initializing terminal...</span>
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
          <button
            onClick={reloadTerminal}
            disabled={!connected}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-gray-800/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Reload Terminal"
          >
            <RefreshCw size={16} />
          </button>
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