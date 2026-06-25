"use client";

import { Terminal as TerminalIcon } from "lucide-react";
import { Loading } from "@/components/ui/Loading/Loading";

interface PendingMessage {
  type: string;
  content: string;
  timestamp: number;
}

interface TerminalPaneProps {
  tabId: string;
  isVisible: boolean;
  isReady: boolean;
  connected: boolean;
  tabActive: Record<string, boolean>;
  tabReady: Record<string, boolean>;
  loadingMsg: string;
  pendingMessages: PendingMessage[];
  registerDiv: (tabId: string) => (el: HTMLDivElement | null) => void;
}

export function TerminalPane({
  tabId, isVisible, isReady, connected,
  tabActive, tabReady, loadingMsg, pendingMessages, registerDiv,
}: TerminalPaneProps) {
  return (
    <div className={`absolute inset-0 ${isVisible ? "flex flex-col" : "hidden"}`}>
      <div
        ref={registerDiv(tabId)}
        className={`flex-1 min-h-0 ${isReady ? "opacity-100" : "opacity-0"}`}
        style={{ background: "#080808" }}
      />
      {!isReady && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6"
          style={{ background: "var(--ide-bg)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--ide-elevated)" }}
          >
            <TerminalIcon className="w-4 h-4 text-zinc-500" />
          </div>
          <Loading variant="default" scale="lg" pattern="pulse" loadingMessage={loadingMsg} />
          {pendingMessages.length > 0 && (
            <div className="max-h-24 overflow-y-auto custom-scroll w-full max-w-sm space-y-1">
              {pendingMessages.slice(-3).map((msg, i) => (
                <div
                  key={`${msg.timestamp}-${i}`}
                  className={`text-[10px] px-2 py-1 rounded border-l-2 ${
                    msg.type === "error"
                      ? "border-red-500 text-red-400"
                      : msg.type === "success"
                        ? "border-green-500 text-green-400"
                        : "border-zinc-600 text-zinc-500"
                  }`}
                  style={{ background: "var(--ide-elevated)" }}
                >
                  <span className="font-medium capitalize">{msg.type}:</span> {msg.content}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
