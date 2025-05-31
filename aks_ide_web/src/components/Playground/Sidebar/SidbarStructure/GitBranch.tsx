import { RefreshCw, Search } from "lucide-react";
import { FaGithub } from "react-icons/fa";

const GitBranch = () => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-zinc-950 to-zinc-900">
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="text-zinc-100 font-semibold text-sm">
              Git Repository
            </h3>
          </div>
          <button className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all duration-200">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search branches..."
            className="w-full pl-9 h-8 bg-zinc-800/50 border border-zinc-700/50 text-zinc-100 text-xs rounded
                       focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50
                       transition-all duration-200 placeholder-zinc-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="p-3">
          <div className="bg-zinc-900/50 rounded border border-zinc-800/50 overflow-hidden">
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-zinc-800/50 rounded-full flex items-center justify-center mb-3 mx-auto">
                <FaGithub className="w-6 h-6 text-purple-500" />
              </div>
              <h4 className="text-zinc-300 font-medium text-sm mb-2">
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
