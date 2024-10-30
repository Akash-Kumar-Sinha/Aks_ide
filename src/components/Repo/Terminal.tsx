import { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";

import { socket } from "@/utils/Socket";
import "@xterm/xterm/css/xterm.css";

const Terminal = () => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const terminal = new XTerminal({
      rows: 20,
      cols: 100,
      theme: {
        background: "#1A1B1E",
        foreground: "#E0E1DA",
        cursor: "#E0E1DA",
      },
    });

    if (terminalRef.current) {
      terminal.open(terminalRef.current);
      terminal.focus();
    }

    terminal.onData((data) => {
      socket.emit("terminal_write", data);
    });

    const handleTerminalData = (data: string) => {
      terminal.write(data);
    };

    socket.on("terminal_data", handleTerminalData);

    return () => {
      socket.off("terminal_data", handleTerminalData);
      terminal.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col p-2 bg-zinc-900 rounded-lg shadow-lg overflow-auto h-full">
      <div className="text-sm font-semibold text-gray-300">Terminal</div>
      <div
        ref={terminalRef}
        className="flex-grow overflow-hidden border border-gray-600 rounded-lg p-1"
      ></div>
    </div>
  );
};

export default Terminal;
