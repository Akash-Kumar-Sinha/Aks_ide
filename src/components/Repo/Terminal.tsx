import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";

import { socket } from "@/utils/Socket";
import "@xterm/xterm/css/xterm.css";
import useUserProfile from "@/utils/useUserProfile";
import Loading from "../Loading";
import { Button } from "../ui/button";

interface TerminalProps {
  selectedFile: string 
  openRepo: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ selectedFile,openRepo }) => {
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
    <div className="flex flex-col px-2 bg-zinc-900 rounded-lg shadow-lg overflow-auto h-full">
      <div className="text-xs font-semibold text-[#B2B8C3] flex items-center justify-between">
        <div className="flex gap-2">
          Terminal
          <div className="text-xs text-gray-400 font-semibold tracking-wider">
            {selectedFile || "No file selected"}
          </div>
        </div>
        <div>
          {userProfile && (
            <Button variant="default" onClick={openRepo} className="py-0 ">Open</Button>
          )}
        </div>
      </div>
      <div className="flex-grow overflow-hidden border border-gray-600 rounded-lg p-1">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loading size={80} />
          </div>
        ) : (
          <>
            {!userProfile && (
              <span className="pt-5 flex justify-center text-2xl font-semibold tracking-wider h-full text-[#5b3f8b] ">
                You are not logged in...
              </span>
            )}
          </>
        )}
        <div ref={terminalRef}></div>
      </div>
    </div>
  );
};

export default Terminal;
