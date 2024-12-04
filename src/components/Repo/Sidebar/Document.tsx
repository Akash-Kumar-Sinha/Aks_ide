import useInstallationGuide from "@/utils/useInstallationGuide";
import { useState } from "react";
import { IoCopyOutline } from "react-icons/io5";

const Document = () => {
  const { installationCommands } = useInstallationGuide();
  const [searchQuery, setSearchQuery] = useState("");

  const copyToClipboard = (command: string) => {
    navigator.clipboard.writeText(command).then(() => {
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
    <div className="w-72 h-full bg-zinc-950 flex flex-col overflow-y-scroll text-sm">
      <div className="p-4 border-b border-zinc-800 text-white">
        <input
          type="text"
          placeholder="Search for commands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-800 text-white rounded border border-zinc-700 p-2"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          Installation Guide
        </h3>
        {commandsToDisplay.map(
          (commandGroup, index) =>
            commandGroup.commands.length > 0 && (
              <div
                key={index}
                className="mb-6 bg-zinc-900 rounded-lg p-4 shadow"
              >
                <h4 className="font-semibold text-purple-500 text-sm mb-2">
                  {commandGroup.title}
                </h4>
                <p className="text-gray-400 text-xs mb-2">
                  {commandGroup.description}
                </p>
                <ul className="space-y-2">
                  {commandGroup.commands.map((command, cmdIndex) => (
                    <li
                      key={cmdIndex}
                      className="flex items-center justify-between text-white bg-zinc-800 p-2 rounded hover:bg-zinc-700"
                    >
                      <span className="truncate">{command}</span>
                      <button
                        onClick={() => copyToClipboard(command)}
                        className="text-yellow-400 hover:text-yellow-500"
                        title="Copy to Clipboard"
                      >
                        <IoCopyOutline />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
        )}

        {commandsToDisplay.every((group) => group.commands.length === 0) && (
          <p className="text-gray-400 text-center mt-8">
            No commands match your search.
          </p>
        )}
      </div>
    </div>
  );
};

export default Document;
