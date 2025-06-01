import { useState } from "react";
import toast from "react-hot-toast";
import { Search, Copy, Terminal } from "lucide-react";
import useInstallationGuide from "../../../../utils/useInstallationGuide";
import useTheme from "../../../ui/lib/useTheme";
import { Input } from "../../../ui/Input/Input";

const Document = () => {
  const { installationCommands } = useInstallationGuide();
  const { theme } = useTheme();
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
      className="h-full flex flex-col"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{
          borderColor: `${theme.textDimmed}30`,
          backgroundColor: theme.backgroundColor,
        }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: theme.primaryColor }}
          ></div>
          <h3
            className="font-semibold text-sm"
            style={{ color: theme.textColor }}
          >
            Installation Guide
          </h3>
        </div>

        <div className="relative">
          <Input
            Icon={Search}
            type="text"
            variant="minimal"
            placeholder="Search for commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto scrollable-container">
        <div className="p-3">
          {commandsToDisplay.map(
            (commandGroup, index) =>
              commandGroup.commands.length > 0 && (
                <div
                  key={index}
                  className="mb-4 rounded border overflow-hidden transition-all duration-200"
                  style={{
                    backgroundColor: theme.backgroundColor,
                    borderColor: `${theme.textDimmed}30`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${theme.textDimmed}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${theme.textDimmed}30`;
                  }}
                >
                  <div
                    className="px-3 py-2 border-b"
                    style={{
                      borderColor: `${theme.textDimmed}30`,
                      backgroundColor: theme.backgroundColor,
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <Terminal
                        className="w-3.5 h-3.5"
                        style={{ color: theme.primaryColor }}
                      />
                      <h4
                        className="font-semibold text-xs"
                        style={{ color: theme.primaryColor }}
                      >
                        {commandGroup.title}
                      </h4>
                    </div>
                    <p
                      className="text-xs mt-1 leading-relaxed"
                      style={{ color: theme.textDimmed }}
                    >
                      {commandGroup.description}
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    {commandGroup.commands.map((command, cmdIndex) => (
                      <div
                        key={cmdIndex}
                        className="flex items-center justify-between p-2 rounded transition-all duration-200 group"
                        style={{
                          backgroundColor: `${theme.backgroundColor}DD`,
                          color: theme.textColor,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${theme.backgroundColor}BB`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${theme.backgroundColor}DD`;
                        }}
                      >
                        <code className="flex-1 text-xs font-mono pr-2 break-all leading-relaxed">
                          {command}
                        </code>
                        <button
                          onClick={() => copyToClipboard(command)}
                          className="flex-shrink-0 p-1.5 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
                          style={{ color: theme.textDimmed }}
                          title="Copy to Clipboard"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = theme.primaryColor;
                            e.currentTarget.style.backgroundColor = `${theme.accentColor}50`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = theme.textDimmed;
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
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
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: theme.backgroundColor }}
              >
                <Search
                  className="w-6 h-6"
                  style={{ color: theme.textDimmed }}
                />
              </div>
              <h4
                className="font-medium text-sm mb-1"
                style={{ color: theme.textColor }}
              >
                No commands match your search
              </h4>
              <p className="text-xs" style={{ color: theme.textDimmed }}>
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
