import { useEffect, useRef } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { socket } from "@/utils/Socket";

const Terminal = ({ name }: { name: string }) => {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const terminal = new XTerminal({
      rows: 15,
    });
    if (terminalRef.current) {
      terminal.open(terminalRef.current);
    }

    terminal.onData((data) => {
      socket.emit("terminal_write", data);
    });

    const handleTerminalData = (data: string) => {
      console.log("Received from socket:", data);
      terminal.write(data);
    };

    console.log("Attaching socket listener");
    socket.on("terminal_data", handleTerminalData);

    return () => {
      console.log("Cleaning up socket listener");
      socket.off("terminal_data", handleTerminalData);
      terminal.dispose();
    };
  }, []);

  return (
    <div className="text-sm p-0">
      <span className="text-green-500">{name}</span>
      <div ref={terminalRef}></div>
    </div>
  );
};

export default Terminal;
