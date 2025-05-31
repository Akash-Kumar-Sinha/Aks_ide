import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  KeyRound,
  Terminal as TerminalIcon,
  Play,
} from "lucide-react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  CardBadge,
} from "../ui/Card/Card";
import { Button } from "../ui/Button/Button";
import { Loading } from "../ui/Loading/Loading";
import useTheme from "../ui/lib/useTheme";
import type { SaveStatus } from "../../pages/Playground";
import useUserProfile from "../../utils/useUserProfile";
import socket from "../../utils/Socket";

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
  const { theme } = useTheme();
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
        background: theme.backgroundColor,
        foreground: theme.textColor,
        cursor: theme.primaryColor,
        cursorAccent: theme.backgroundColor,
        black: theme.textDimmed,
        red: theme.errorColor,
        green: theme.successColor,
        yellow: theme.warningColor,
        blue: theme.primaryColor,
        magenta: theme.primaryShade,
        cyan: theme.infoColor,
        white: theme.textColor,
        brightBlack: theme.secondaryColor,
        brightRed: theme.errorColor,
        brightGreen: theme.successColor,
        brightYellow: theme.warningColor,
        brightBlue: theme.primaryShade,
        brightMagenta: theme.accentColor,
        brightCyan: theme.infoColor,
        brightWhite: theme.textColor,
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
  }, [user, handleResizeTerminal, terminalActive, theme]);

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
      saving: { text: "Saving", variant: "info" as const, animate: true },
      saved: { text: "Saved", variant: "success" as const, animate: false },
      error: { text: "Error", variant: "error" as const, animate: false },
    };

    const config = statusConfig[saveStatus];

    return (
      <CardBadge
        variant={config.variant}
        scale="sm"
        className={config.animate ? "animate-pulse" : ""}
      >
        {config.text}
      </CardBadge>
    );
  };

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <div
          className={`w-2 h-2 rounded-full transition-colors duration-200`}
          style={{
            backgroundColor:
              terminalActive && terminalReady
                ? theme.successColor
                : terminalActive
                ? theme.warningColor
                : theme.errorColor,
            boxShadow: `0 0 4px ${
              terminalActive && terminalReady
                ? theme.successColor + "50"
                : terminalActive
                ? theme.warningColor + "50"
                : theme.errorColor + "50"
            }`,
          }}
        />
        <span className="text-xs" style={{ color: theme.textDimmed }}>
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
          }`}
          style={{
            backgroundColor: connected ? theme.successColor : theme.errorColor,
            boxShadow: `0 0 4px ${
              connected ? theme.successColor + "50" : theme.errorColor + "50"
            }`,
          }}
        />
        <span className="text-xs" style={{ color: theme.textDimmed }}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );

  const TerminalHeader = () => (
    <CardHeader showBorder={true}>
      <div className="flex flex-col gap-3 w-full">
        {/* Main Header Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-3 sm:gap-4">
          {/* Left Section - Terminal Title & Status */}
          <div className="flex items-center gap-2 min-w-0">
            <TerminalIcon
              className="w-4 h-4 shrink-0"
              style={{ color: theme.primaryColor }}
            />
            <CardTitle
              className="text-sm font-medium"
              style={{ color: theme.textColor }}
            >
              Terminal
            </CardTitle>
            {selectedFile && (
              <CardBadge
                variant="primary"
                scale="sm"
                className="truncate max-w-full"
                title={selectedFile}
              >
                📁 {selectedFile.split("/").pop()}
              </CardBadge>
            )}

            <SaveStatusComponent />
            <div className="hidden sm:block">
              <ConnectionStatus />
            </div>
          </div>

          {/* Right Section - Controls */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="block sm:hidden">
              <ConnectionStatus />
            </div>

            <div className="flex items-center gap-1">
              <Button
                onClick={clearTerminal}
                disabled={!terminalActive || !terminalReady}
                className="px-2 py-1 text-xs"
                style={{ color: theme.textDimmed }}
                variant="minimal"
                title="Clear Terminal"
              >
                <span className="hidden sm:inline">Clear</span>
                <span className="sm:hidden">C</span>
              </Button>

              <Button
                onClick={reloadTerminal}
                disabled={!connected}
                className="p-1"
                style={{ color: theme.textDimmed }}
                variant="minimal"
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
              Icon={Play}
              iconPosition="left"
            >
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
    </CardHeader>
  );
  const LoadingCard = () => (
    <Card scrollable scrollDirection="vertical" scrollVariant="gradient">
      <TerminalHeader />
      <CardContent className="flex flex-col items-center justify-center h-full">
        <div
          className="flex flex-col items-center space-y-4 max-w-md mx-auto px-4"
          style={{ color: theme.textDimmed }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: theme.primaryColor + "20" }}
          >
            <TerminalIcon
              className="w-4 h-4"
              style={{ color: theme.primaryColor }}
            />
          </div>
          <Loading
            variant="default"
            scale="lg"
            pattern="pulse"
            loadingMessage={loadingMessage}
          />

          <div
            className="text-xs text-center"
            style={{ color: theme.textDimmed }}
          >
            Connected: {connected ? "✓" : "✗"} | Active:{" "}
            {terminalActive ? "✓" : "✗"} | Ready: {terminalReady ? "✓" : "✗"}
          </div>

          {pendingMessages.length > 0 && (
            <div className="mt-4 space-y-2 w-full max-h-32 overflow-y-auto">
              {pendingMessages.slice(-3).map((message, index) => (
                <div
                  key={`${message.timestamp}-${index}`}
                  className="text-xs p-2 rounded border-l-2"
                  style={{
                    backgroundColor:
                      message.type === "error"
                        ? theme.errorColor + "20"
                        : message.type === "success"
                        ? theme.successColor + "20"
                        : theme.warningColor + "20",
                    borderLeftColor:
                      message.type === "error"
                        ? theme.errorColor
                        : message.type === "success"
                        ? theme.successColor
                        : theme.warningColor,
                    color:
                      message.type === "error"
                        ? theme.errorColor
                        : message.type === "success"
                        ? theme.successColor
                        : theme.warningColor,
                  }}
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
      </CardContent>
    </Card>
  );

  // Loading state while fetching user profile
  if (loading) {
    return (
      <Card scrollable scrollDirection="vertical" scrollVariant="gradient">
        <CardHeader showBorder={true}>
          <div className="flex items-center gap-2">
            <TerminalIcon
              className="w-4 h-4"
              style={{ color: theme.primaryColor }}
            />
            <CardTitle
              className="text-sm font-medium"
              style={{ color: theme.textColor }}
            >
              Terminal
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full">
          <Loading
            variant="default"
            scale="lg"
            pattern="pulse"
            loadingMessage="Loading user profile..."
          />
        </CardContent>
      </Card>
    );
  }

  // No user authenticated
  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full">
          <div className="text-center space-y-4 p-8">
            <div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: theme.primaryGradient,
                boxShadow: `0 8px 32px ${theme.primaryColor}25`,
              }}
            >
              <KeyRound
                className="w-7 h-7"
                style={{ color: theme.textColor }}
              />
            </div>
            <div>
              <CardTitle className="text-xl mb-2">
                Authentication Required
              </CardTitle>
              <CardDescription className="max-w-sm">
                Please sign in to access the terminal and start coding
              </CardDescription>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (terminalActive && terminalReady) {
    return (
      <Card scrollable scrollDirection="vertical" scrollVariant="gradient">
        <TerminalHeader />
        <CardContent
        // scrollable
        // scrollDirection="vertical"
        // scrollVariant="gradient"
        >
          <div ref={terminalRef} className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }

  return <LoadingCard />;
};

export default Terminal;
