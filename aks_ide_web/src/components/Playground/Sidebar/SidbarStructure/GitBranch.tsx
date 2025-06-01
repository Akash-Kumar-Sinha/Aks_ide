import { RefreshCw, Search } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import useTheme from "../../../ui/lib/useTheme";
import { Input } from "../../../ui/Input/Input";

const GitBranch = () => {
  const { theme } = useTheme();

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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.primaryColor }}
            ></div>
            <h3
              className="font-semibold text-sm"
              style={{ color: theme.textColor }}
            >
              Git Repository
            </h3>
          </div>
          <button
            className="p-1 rounded transition-all duration-200"
            style={{ color: theme.textDimmed }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.textColor;
              e.currentTarget.style.backgroundColor = `${theme.backgroundColor}CC`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.textDimmed;
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative">
          <Input
            Icon={Search}
            type="text"
            placeholder="Search branches..."
            variant="minimal"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="p-3">
          <div
            className="rounded border overflow-hidden"
            style={{
              backgroundColor: theme.backgroundColor,
              borderColor: `${theme.textDimmed}30`,
            }}
          >
            <div className="p-4 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
                style={{ backgroundColor: `${theme.backgroundColor}CC` }}
              >
                <FaGithub
                  className="w-6 h-6"
                  style={{ color: theme.primaryColor }}
                />
              </div>
              <h4
                className="font-medium text-sm mb-2"
                style={{ color: theme.textColor }}
              >
                Git Will be added soon
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitBranch;
