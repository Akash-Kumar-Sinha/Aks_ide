"use client";

import React from "react";
import { KeyRound, Terminal as TerminalIcon } from "lucide-react";
import "xterm/css/xterm.css";
import { Loading } from "@/components/ui/Loading/Loading";
import { useTerminal } from "./hooks/useTerminal";
import { TerminalTabBar } from "./TerminalTabBar";
import { TerminalToolbar } from "./TerminalToolbar";
import { TerminalPane } from "./TerminalPane";
import type { SaveStatus } from "./types";

interface TerminalProps {
  selectedFile?: string;
  saveStatus: SaveStatus;
}

const Terminal: React.FC<TerminalProps> = ({
  selectedFile,
  saveStatus,
}) => {
  const {
    user,
    loading,
    connected,
    terminalTabs,
    activeTerminalId,
    setActiveTerminalId,
    tabReady,
    tabActive,
    tabLoadingMsg,
    pendingMessages,
    registerDiv,
    addTerminalTab,
    closeTerminalTab,
    reloadTerminal,
    clearTerminal,
  } = useTerminal();

  if (loading) {
    return (
      <div
        className="h-full flex flex-col"
        style={{ background: "var(--ide-bg)" }}
      >
        <div
          className="flex items-center gap-2 px-3 h-8 shrink-0"
          style={{
            background: "var(--ide-panel)",
            borderBottom: "1px solid var(--ide-border)",
          }}
        >
          <TerminalIcon className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-xs text-zinc-500">Terminal</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loading
            variant="default"
            scale="lg"
            pattern="pulse"
            loadingMessage="Loading user profile…"
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="h-full flex flex-col items-center justify-center gap-3"
        style={{ background: "var(--ide-bg)" }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "var(--ide-elevated)" }}
        >
          <KeyRound className="w-5 h-5 text-zinc-500" />
        </div>
        <span className="text-sm text-zinc-600">
          Sign in to access the terminal
        </span>
      </div>
    );
  }

  const activeIsReady = !!(
    tabReady[activeTerminalId] && tabActive[activeTerminalId]
  );

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--ide-bg)" }}
    >
      <div
        className="flex items-center shrink-0 h-8"
        style={{
          background: "var(--ide-panel)",
          borderBottom: "1px solid var(--ide-border)",
        }}
      >
        <TerminalTabBar
          tabs={terminalTabs}
          activeId={activeTerminalId}
          onTabClick={setActiveTerminalId}
          onTabClose={closeTerminalTab}
          onAdd={addTerminalTab}
        />
        <TerminalToolbar
          saveStatus={saveStatus}
          selectedFile={selectedFile}
          connected={connected}
          activeTerminalId={activeTerminalId}
          tabActive={tabActive}
          tabReady={tabReady}
          activeIsReady={activeIsReady}
          onClear={clearTerminal}
          onReload={reloadTerminal}
        />
      </div>

      <div className="relative flex-1 overflow-hidden">
        {terminalTabs.map((tab) => (
          <TerminalPane
            key={tab.id}
            tabId={tab.id}
            isVisible={tab.id === activeTerminalId}
            isReady={!!(tabReady[tab.id] && tabActive[tab.id])}
            connected={connected}
            tabActive={tabActive}
            tabReady={tabReady}
            loadingMsg={tabLoadingMsg[tab.id] ?? "Initializing terminal"}
            pendingMessages={pendingMessages[tab.id] ?? []}
            registerDiv={registerDiv}
          />
        ))}
      </div>
    </div>
  );
};

export default Terminal;
