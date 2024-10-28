import { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { socket } from "@/utils/Socket";

const Terminal = ({ name }: { name: string }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const terminal = new XTerminal({
      rows: 20,
      cols: 100,
      theme: { background: "#1A1B1E", foreground: "#E0E1DA" },
    });
    if (terminalRef.current) {
      terminal.open(terminalRef.current);
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
    <div className="text-sm px-2 bg-zinc-900 text-[#E0E1DA] rounded-lg shadow-md">
      <div className="text-green-500 mb-2">{name}</div>
      <div ref={terminalRef} className="h-48 overflow-hidden"></div>
    </div>
  );
};

export default Terminal;
