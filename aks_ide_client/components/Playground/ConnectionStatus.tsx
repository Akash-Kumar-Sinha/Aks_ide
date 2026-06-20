"use client";

interface ConnectionStatusProps {
  connected: boolean;
  terminalActive: boolean;
  terminalReady: boolean;
}

export function ConnectionStatus({
  connected,
  terminalActive,
  terminalReady,
}: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
            terminalActive && terminalReady
              ? "bg-green-500"
              : terminalActive
              ? "bg-yellow-500"
              : "bg-zinc-600"
          }`}
        />
        <span className="text-xs text-zinc-500">
          {terminalActive && terminalReady
            ? "Ready"
            : terminalActive
            ? "Starting"
            : "Offline"}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <div
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
            !connected ? "animate-pulse" : ""
          } ${connected ? "bg-green-500" : "bg-red-500/70"}`}
        />
        <span className="text-xs text-zinc-500">
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
}

export default ConnectionStatus;
