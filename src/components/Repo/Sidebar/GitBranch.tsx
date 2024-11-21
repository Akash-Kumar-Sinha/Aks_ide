import React from "react";

const GitBranch = () => {
  return (
    <div className="w-40 min-w-full max-w-40 h-full bg-zinc-950 flex flex-col overflow-x-scroll">
      <div className="p-4 border-b border-zinc-800 text-white text-sm font-semibold">
        Git
      </div>
      <div className="flex-grow overflow-y-auto">
        <div className="p-4">
          <div className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded py-2">
            Git will be added soon
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitBranch;
