import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";

import "@xterm/xterm/css/xterm.css";

import { socket } from "@/utils/Socket";
import useUserProfile from "@/utils/useUserProfile";
import Loading from "../Loading";
import { Button } from "../ui/button";

interface TerminalProps {
  selectedFile: string;
  openRepo: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ selectedFile, openRepo }) => {
  const { userProfile, loading } = useUserProfile();
  const terminalRef = useRef<HTMLDivElement>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile && profileId !== userProfile.id) {
      setProfileId(userProfile.id);
      socket.emit("load_terminal", userProfile.id);
    }
  }, [userProfile, profileId]);

  useEffect(() => {
    if (!userProfile) return;

    const terminal = new XTerminal({
      rows: 11,
      cols: 100,
      theme: {
        background: "#09090B",
        foreground: "#9333ea",
        cursor: "#E0E1DA",
      },
      fontSize: 14,
      fastScrollSensitivity: 5,
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
  }, [userProfile]);

  return (
    <div className="flex flex-col px-2 bg-zinc-950 rounded-lg shadow-lg ">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-xs font-semibold text-[#B2B8C3] justify-center items-center">
          <span>Terminal</span>
          <span className="text-yellow-400 font-semibold tracking-wider">
            {selectedFile || "No file selected"}
          </span>
        </div>
        {userProfile && (
          <>
            <div className="text-zinc-500 text-xs hidden lg:block">
              <span className="text-zinc-400 font-bold">hint: </span>
              <span>
                In the terminal, navigate to the desired directory, then click
                "Open" to view it in the file explorer.
              </span>
            </div>
            <Button
              variant="default"
              onClick={openRepo}
              className="bg-purple-600 hover:bg-purple-500 text-white transition-all duration-300 shadow-md text-xs px-4 h-fit m-1 py-1 rounded-lg"
            >
              Open
            </Button>
          </>
        )}
      </div>

      <div className="flex-grow border border-zinc-600 rounded-lg px-1 py-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loading size={60} />
          </div>
        ) : !userProfile ? (
          <span className="flex justify-center items-center h-full text-xl font-semibold tracking-wider text-[#5b3f8b]">
            You are not logged in...
          </span>
        ) : (
          <div
            ref={terminalRef}
            className="h-full w-full min:w-auto overflow-auto lg:overflow-hidden"
          ></div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
