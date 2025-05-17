import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { socket } from "@/utils/Socket";
import Loading from "@/utils/Loading";
import useUserProfile from "@/utils/useUserProfile";

type TerminalProps = {
  containerClassName?: string;
};

const Terminal: React.FC<TerminalProps> = ({ containerClassName = "" }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const { userProfile: user, loading } = useUserProfile();

  const terminalInstance = useRef<XTerminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const [connected, setConnected] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);



  // Handle socket connection
  useEffect(() => {
    if (socket.connected) {
      console.log("Socket already connected on mount with ID:", socket.id);
      setConnected(true);
      
      if (user) {
        console.log("Emitting load_terminal on mount for:", user.email);
        socket.emit("load_terminal", { email: user.email });
      }
    } else {
      console.log("Socket not connected on mount, attempting to connect...");
      socket.connect();
    }

    const handleConnect = () => {
      console.log("Socket connected with ID:", socket.id);
      setConnected(true);
      
      if (user) {
        console.log("Emitting load_terminal after connect for:", user.email);
        socket.emit("load_terminal", { email: user.email });
      }
    };

    const handleDisconnect = () => {
      console.log("Disconnected from socket server");
      setConnected(false);
      setTerminalActive(false);
      
      if (terminalInstance.current) {
        terminalInstance.current.write("\r\n\x1b[31mDisconnected from server. Terminal session ended.\x1b[0m\r\n");
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [user]);

  // Handle terminal events
  useEffect(() => {
    const handleTerminalSuccess = (data: string) => {
      console.log("terminal_success", data);
      setTerminalActive(true);
      
      if (terminalInstance.current) {
        terminalInstance.current.write(`\r\n\x1b[32m${data}\x1b[0m\r\n`);
      }
      
      if (user) {
        console.log("Emitting render_terminal after success for:", user.email);
        socket.emit("render_terminal", { email: user.email });
      }
    };

    const handleTerminalError = (errorMsg: string) => {
      console.error("Terminal error:", errorMsg);
      
      if (terminalInstance.current) {
        terminalInstance.current.write(`\r\n\x1b[31mError: ${errorMsg}\x1b[0m\r\n`);
      }
    };

    const handleLoadedTerminal = (msg: string) => {
      console.log("Terminal loaded:", msg);
      
      if (terminalInstance.current) {
        terminalInstance.current.write(`\r\n\x1b[32m${msg}\x1b[0m\r\n`);
      }
      
      if (user) {
        console.log("Emitting render_terminal after load for:", user.email);
        socket.emit("render_terminal", { email: user.email });
        setTerminalActive(true);
      }
    };

    socket.on("terminal_success", handleTerminalSuccess);
    socket.on("terminal_error", handleTerminalError);
    socket.on("loaded_terminal", handleLoadedTerminal);

    return () => {
      socket.off("terminal_success", handleTerminalSuccess);
      socket.off("terminal_error", handleTerminalError);
      socket.off("loaded_terminal", handleLoadedTerminal);
    };
  }, [user]);

  // Initialize XTerm terminal
  useEffect(() => {
    if (!user || !terminalRef.current || terminalInstance.current) return;

    console.log("Initializing terminal");
    const terminal = new XTerminal({
      theme: {
        background: "#09090B",
        foreground: "#9333ea",
        cursor: "#E0E1DA",
        cursorAccent: "#000000",
        black: "#000000",
        red: "#FF5555",
        green: "#50FA7B",
        yellow: "#F1FA8C",
        blue: "#BD93F9",
        magenta: "#FF79C6",
        cyan: "#8BE9FD",
        white: "#BFBFBF",
        brightBlack: "#4D4D4D",
        brightRed: "#FF6E6E",
        brightGreen: "#69FF94",
        brightYellow: "#FFFFA5",
        brightBlue: "#D6ACFF",
        brightMagenta: "#FF92DF",
        brightCyan: "#A4FFFF",
        brightWhite: "#E6E6E6",
      },
      fontSize: 14,
      fontFamily: "'Fira Code', monospace",
      cursorBlink: true,
      cursorStyle: "block",
      scrollback: 1000,
      allowTransparency: true,
    });

    // Create and load fit addon
    const fit = new FitAddon();
    terminal.loadAddon(fit);
    fitAddon.current = fit;

    // Open terminal
    terminal.open(terminalRef.current);
    setTimeout(() => {
      try {
        fit.fit();
      } catch (err) {
        console.error("Error fitting terminal:", err);
      }
    }, 100);
    
    terminal.focus();
    terminal.write('Terminal initialized. Connecting to server...\r\n');
    terminal.write(`Socket status: ${socket.connected ? '\x1b[32mConnected\x1b[0m' : '\x1b[31mDisconnected\x1b[0m'}\r\n`);
    
    terminalInstance.current = terminal;

    // Handle terminal input
    terminal.onData((data) => {
      if (socket.connected && terminalActive) {
        console.log("Sending terminal input");
        socket.emit("terminal_write", data);
      } else if (!socket.connected) {
        terminal.write('\r\n\x1b[31mSocket disconnected. Cannot send command.\x1b[0m\r\n');
      } else if (!terminalActive) {
        terminal.write('\r\n\x1b[33mTerminal not active yet. Waiting for server...\x1b[0m\r\n');
      }
    });

    // Handle terminal output
    const handleTerminalData = (data: string) => {
      if (terminalInstance.current) {
        terminalInstance.current.write(data);
      }
    };

    socket.on("terminal_data", handleTerminalData);

    // Handle terminal resize
    const handleResize = () => {
      if (fitAddon.current && terminalInstance.current) {
        try {
          fitAddon.current.fit();
        } catch (err) {
          console.error("Error resizing terminal:", err);
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      socket.off("terminal_data", handleTerminalData);
      window.removeEventListener('resize', handleResize);
      fitAddon.current = null;
      terminal.dispose();
      terminalInstance.current = null;
    };
  }, [user, terminalActive]);

  // Test connection and reload terminal
  const testConnection = () => {
    if (socket.connected) {
      console.log("Testing connection");
      socket.emit("message", "test message");
      
      if (terminalInstance.current) {
        terminalInstance.current.write("\r\n> Testing connection...\r\n");
      }
    } else {
      console.log("Socket not connected, reconnecting...");
      socket.connect();
      
      if (terminalInstance.current) {
        terminalInstance.current.write("\r\n\x1b[33mReconnecting...\x1b[0m\r\n");
      }
    }
  };

  const reloadTerminal = () => {
    if (!user || !socket.connected) return;
    
    console.log("Reloading terminal");
    setTerminalActive(false);
    
    if (terminalInstance.current) {
      terminalInstance.current.write("\r\n\x1b[33mReloading terminal...\x1b[0m\r\n");
    }
    
    socket.emit("load_terminal", { email: user.email });
  };

  return (
    <div className={`flex flex-col bg-zinc-950 rounded-lg shadow-lg h-80 ${containerClassName}`}>
      <div className="flex justify-between items-center p-2 border-b border-zinc-800">
        <span className="text-purple-500 font-semibold">Terminal</span>
        <div className="flex space-x-2">
          <button 
            onClick={testConnection}
            className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white rounded text-sm"
          >
            Test Connection
          </button>
          {connected && (
            <button 
              onClick={reloadTerminal}
              className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-sm"
            >
              Reload Terminal
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-grow border border-zinc-800 rounded-lg m-2 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loading />
          </div>
        ) : !user ? (
          <div className="flex justify-center items-center h-full text-xl font-semibold text-purple-700">
            Not logged in
          </div>
        ) : (
          <div
            ref={terminalRef}
            className="h-full w-full"
            style={{ padding: '4px' }}
          />
        )}
      </div>
      
      <div className="flex justify-between items-center p-2 text-xs text-gray-400">
        <div>
          {socket.id ? `Socket ID: ${socket.id}` : 'Not connected'}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${terminalActive ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>Terminal: {terminalActive ? 'Active' : 'Initializing'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>Socket: {connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;