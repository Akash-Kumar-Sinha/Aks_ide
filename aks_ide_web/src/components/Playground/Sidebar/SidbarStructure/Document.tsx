import { useState } from "react";
import toast from "react-hot-toast";
import { Search, Copy, Terminal } from "lucide-react";
import useInstallationGuide from "../../../../utils/useInstallationGuide";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <ScrollArea className="h-full flex flex-col bg-[#000000]">
      <div className="px-4 py-3 bg-[#1a1a1a] border-b border-[#333333]">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#569cd6]"></div>
          <h3 className="font-semibold text-sm text-[#cccccc]">
            Installation Guide
          </h3>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#808080]" />
          <Input
            type="text"
            placeholder="Search for commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#333333] border-[#555555] text-[#cccccc] placeholder-[#808080] focus:border-[#569cd6] focus:ring-0"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {commandsToDisplay.map(
            (commandGroup, index) =>
              commandGroup.commands.length > 0 && (
                <div key={index} className="mb-4 rounded-md bg-[#1a1a1a]">
                  <div className="px-3 py-2 bg-[#333333] rounded-t-md">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-3.5 h-3.5 text-[#569cd6]" />
                      <h4 className="font-semibold text-xs text-[#569cd6]">
                        {commandGroup.title}
                      </h4>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed text-[#808080]">
                      {commandGroup.description}
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    {commandGroup.commands.map((command, cmdIndex) => (
                      <div
                        key={cmdIndex}
                        className="flex items-center justify-between p-2 rounded-sm transition-colors duration-150 group bg-[#000000] text-[#cccccc] hover:bg-[#333333]"
                      >
                        <code className="flex-1 text-xs font-mono pr-2 break-all leading-relaxed">
                          {command}
                        </code>
                        <button
                          onClick={() => copyToClipboard(command)}
                          className="flex-shrink-0 p-1.5 rounded transition-colors duration-150 opacity-0 group-hover:opacity-100 text-[#808080] hover:text-[#569cd6] hover:bg-[#333333]"
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

          {commandsToDisplay.every((group) => group.commands.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-md flex items-center justify-center mb-3 bg-[#333333]">
                <Search className="w-6 h-6 text-[#808080]" />
              </div>
              <h4 className="font-medium text-sm mb-1 text-[#cccccc]">
                No commands match your search
              </h4>
              <p className="text-xs text-[#808080]">
                Try different keywords or clear your search
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </ScrollArea>
  );
};

export default Document;
