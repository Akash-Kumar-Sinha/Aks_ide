"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Search, Copy, Terminal } from "lucide-react";
import useInstallationGuide from "@/utils/useInstallationGuide";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Document = () => {
  const { installationCommands } = useInstallationGuide();
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command).then(() => {
      toast.success("Copied");
    });
  };

  const filteredCommands = installationCommands.map((commandGroup) => ({
    ...commandGroup,
    commands: commandGroup.commands.filter((command) =>
      commandGroup.keywords?.some(
        (keyword) =>
          command.toLowerCase().includes(searchQuery.toLowerCase()) ||
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ),
  }));

  const commandsToDisplay =
    searchQuery.trim().length === 0 ? installationCommands : filteredCommands;

  return (
    <div
      className="h-full flex flex-col overflow-y-auto custom-scroll"
      style={{ background: "var(--ide-surface)" }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{ background: "var(--ide-panel)", borderColor: "var(--ide-border)" }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          <h3 className="text-xs font-medium text-zinc-400 tracking-wide uppercase">
            Installation Guide
          </h3>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input
            type="text"
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="p-3 space-y-3">
        {commandsToDisplay.map(
          (commandGroup, index) =>
            commandGroup.commands.length > 0 && (
              <div
                key={index}
                className="rounded-md overflow-hidden border"
                style={{ borderColor: "var(--ide-border)" }}
              >
                <div
                  className="px-3 py-2 border-b"
                  style={{ background: "var(--ide-panel)", borderColor: "var(--ide-border)" }}
                >
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-3 h-3 text-zinc-500" />
                    <h4 className="text-xs font-medium text-zinc-400">
                      {commandGroup.title}
                    </h4>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed text-zinc-600">
                    {commandGroup.description}
                  </p>
                </div>

                <div className="p-1.5 space-y-0.5">
                  {commandGroup.commands.map((command, cmdIndex) => (
                    <div
                      key={cmdIndex}
                      className="flex items-center justify-between px-2 py-1.5 rounded transition-colors duration-150 group hover:bg-zinc-800/60"
                    >
                      <code className="flex-1 text-xs font-mono text-zinc-300 pr-2 break-all leading-relaxed">
                        {command}
                      </code>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => copyToClipboard(command)}
                            className="flex-shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700 transition-all"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left">Copy to clipboard</TooltipContent>
                      </Tooltip>
                    </div>
                  ))}
                </div>
              </div>
            )
        )}

        {commandsToDisplay.every((group) => group.commands.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-md flex items-center justify-center mb-3 bg-zinc-800">
              <Search className="w-4 h-4 text-zinc-500" />
            </div>
            <h4 className="text-xs font-medium text-zinc-400 mb-1">
              No commands found
            </h4>
            <p className="text-xs text-zinc-600">
              Try different keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Document;
