import React from "react";
import FileTree from "./FileTree";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import useUserProfile from "@/utils/useUserProfile";
import { Link } from "react-router-dom";

interface ExplorerProps {
  fileStructure: Record<string, unknown | null>;
  setSelectedFile: (path: string) => void;
  createTemplate: () => void;
  projectName: React.RefObject<HTMLInputElement>;
}

const Explorer: React.FC<ExplorerProps> = ({
  fileStructure = {},
  setSelectedFile,
  createTemplate,
  projectName,
}) => {
  const { userProfile } = useUserProfile();
  const handleSelect = (path: string) => {
    setSelectedFile(path);
    console.log("Selected file path:", path);
  };

  return (
    <div className="w-56 h-full bg-[#2C2C32] border-l border-[#3D3D42] flex flex-col shadow-lg rounded-lg p-1">
      <span className="text-sm p-3 tracking-wide text-gray-300">Explorer</span>
      <div className="flex-grow overflow-y-auto p-2">
        {Object.keys(fileStructure || {}).length === 0 ? (
          <Dialog>
            <DialogTrigger className="w-full flex items-center justify-center">
              <Button
                className="bg-[#7554ad] w-full rounded-xl hover:bg-[#5b3f8b] transition-all duration-300 shadow-md text-[#EBEBEF] font-semibold py-2"
                disabled={!userProfile}
              >
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="w-fit lg:w-96 md:w-96">
              <DialogHeader>
                <DialogTitle className="m-2 mb-4 text-center flex flex-col gap-2">
                  Create a new project with Aks Ide
                  {!userProfile && (
                    <p className="text-[#7554ad] text-xs underline">
                      <Link to="/auth">You are not logged in</Link>
                    </p>
                  )}
                </DialogTitle>
                <DialogDescription>
                  <Input
                    ref={projectName}
                    placeholder="Enter Template Name"
                    className="text-gray-800 rounded-xl border border-gray-300"
                    disabled={!userProfile}
                  />
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type="button"
                    className="mt-3 py-2 bg-[#7554ad] text-[#EBEBEF] font-semibold rounded-lg hover:bg-[#5b3f8b] transition-all duration-300 shadow-md"
                    onClick={createTemplate}
                    disabled={!userProfile}
                  >
                    Create
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <div>
            {fileStructure && Object.keys(fileStructure).length > 0 ? (
              <FileTree tree={fileStructure} path="" onSelect={handleSelect} />
            ) : (
              <div className="text-gray-500 text-center">No files found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explorer;
