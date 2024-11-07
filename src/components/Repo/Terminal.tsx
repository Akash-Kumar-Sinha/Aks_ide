import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import { socket } from "@/utils/Socket";
import "@xterm/xterm/css/xterm.css";
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
      socket.emit("profile_id", userProfile.id);
    }
  }, [userProfile, profileId]);

  useEffect(() => {
    if (!userProfile) return;

    const terminal = new XTerminal({
      rows: 11,
      cols: 100,
      theme: {
        background: "#111116",
        foreground: "#7554ad",
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
    <div className="flex flex-col px-4 bg-zinc-900 rounded-lg shadow-lg overflow-hidden h-full">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 text-xs font-semibold text-[#B2B8C3]">
          <span>Terminal</span>
          <span className="text-gray-400 font-semibold tracking-wider">
            {selectedFile || "No file selected"}
          </span>
        </div>
        {userProfile && (
          <>
            <div className="text-gray-500 text-xs flex gap-2">
              <span className="text-gray-400 font-bold">hint:</span>
              <span>
                In the terminal, navigate to the desired directory, then click
                "Open" to view it in the file explorer.
              </span>
            </div>
            <Button
              variant="default"
              onClick={openRepo}
              className="bg-[#7554ad] text-[#EBEBEF] hover:bg-[#5b3f8b] transition-all duration-300 shadow-md text-xs px-4 h-fit m-1 py-1 rounded-lg"
            >
              Open
            </Button>
          </>
        )}
      </div>
      <div className="flex-grow border border-gray-600 rounded-lg px-2 py-1 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loading size={80} />
          </div>
        ) : !userProfile ? (
          <span className="flex justify-center items-center h-full text-2xl font-semibold tracking-wider text-[#5b3f8b]">
            You are not logged in...
          </span>
        ) : (
          <div ref={terminalRef} className="h-full"></div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
