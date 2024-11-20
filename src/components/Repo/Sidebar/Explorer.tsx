import React from "react";
import FileTree from "./FileTree";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loading from "@/components/Loading";
import useUserProfile from "@/utils/useUserProfile";

interface ExplorerProps {
  fileStructure: Record<string, unknown | null>;
  createTemplate: () => void;
  projectName: React.RefObject<HTMLInputElement>;
  explorerloadingStatus: boolean;
  handleSelect: (path: string) => void;
}

const Explorer: React.FC<ExplorerProps> = ({
  fileStructure = {},
  createTemplate,
  projectName,
  explorerloadingStatus,
  handleSelect,
}) => {
  const { userProfile } = useUserProfile();

  return (
    <div className="w-fit min-w-full max-w-60 h-full bg-zinc-950 flex flex-col">
      <div className="p-4 border-b border-zinc-800 text-white text-sm font-semibold">
        Explorer
      </div>
      <div className="flex-grow overflow-y-auto">
        {explorerloadingStatus ? (
          <Loading />
        ) : (
          <>
            {Object.keys(fileStructure).length === 0 ? (
              <div className="p-4">
                <Button
                  onClick={createTemplate}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded py-2"
                  disabled={!userProfile}
                >
                  Create New Project
                </Button>
                <Input
                  ref={projectName}
                  placeholder="Project Name"
                  className="mt-2 w-full border border-zinc-700 bg-zinc-800 text-white rounded"
                />
              </div>
            ) : (
              <FileTree tree={fileStructure} path="" onSelect={handleSelect} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explorer;
