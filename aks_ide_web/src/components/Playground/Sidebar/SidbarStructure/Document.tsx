import { useState } from "react";
import toast from "react-hot-toast";
import { Search, Copy, Terminal } from "lucide-react";
import useInstallationGuide from "../../../../utils/useInstallationGuide";

const Document = () => {
  const { installationCommands } = useInstallationGuide();
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command).then(() => {
      toast.success('Copied')
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
    <div className="h-full flex flex-col bg-gradient-to-b from-zinc-950 to-zinc-900">
      {/* Header Section - Similar to Explorer's ProjectHeader */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
          <h3 className="text-zinc-100 font-semibold text-sm">
            Installation Guide
          </h3>
        </div>

        {/* Search Bar - Similar to Explorer's search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search for commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-8 bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 text-xs rounded
                       focus:ring-1 focus:ring-purple-600/50 focus:border-purple-600/50
                       transition-all duration-200 placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="p-3">
          {commandsToDisplay.map(
            (commandGroup, index) =>
              commandGroup.commands.length > 0 && (
                <div
                  key={index}
                  className="mb-4 bg-zinc-900/50 rounded border border-zinc-800/50 overflow-hidden hover:border-zinc-700/50 transition-all duration-200"
                >
                  {/* Command Group Header */}
                  <div className="px-3 py-2 border-b border-zinc-800/50 bg-zinc-800/30">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-purple-600" />
                      <h4 className="font-semibold text-purple-600 text-xs">
                        {commandGroup.title}
                      </h4>
                    </div>
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
                      {commandGroup.description}
                    </p>
                  </div>

                  {/* Commands List */}
                  <div className="p-2 space-y-1">
                    {commandGroup.commands.map((command, cmdIndex) => (
                      <div
                        key={cmdIndex}
                        className="flex items-center justify-between text-zinc-100 bg-zinc-800/50 p-2 rounded hover:bg-zinc-700/50 transition-all duration-200 group"
                      >
                        <code className="flex-1 text-xs font-mono pr-2 break-all leading-relaxed">
                          {command}
                        </code>
                        <button
                          onClick={() => copyToClipboard(command)}
                          className="flex-shrink-0 p-1.5 rounded text-zinc-500 hover:text-purple-600 hover:bg-zinc-600/50 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Copy to Clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}

          {/* Empty State */}
          {commandsToDisplay.every((group) => group.commands.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-zinc-500" />
              </div>
              <h4 className="text-zinc-300 font-medium text-sm mb-1">
                No commands match your search
              </h4>
              <p className="text-zinc-500 text-xs">
                Try different keywords or clear your search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Document;