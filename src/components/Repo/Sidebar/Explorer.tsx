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
  fileStructure = {},  // Set a default value to avoid undefined/null
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
    <div className="hidden md:block lg:block w-44 bg-[#1A1A1F] border-2 border-[#1C1D2C] flex-col">
      <span className="text-sm p-2 tracking-wide text-gray-400">Explorer</span>
      <div>
        {Object.keys(fileStructure || {}).length === 0 ? ( // Use fileStructure safely
          <Dialog>
            <DialogTrigger className="w-full flex items-center justify-center text-[#EBEBEF] font-semibold ">
              <Button
                className="bg-[#7554ad] w-full m-2 mr-3 rounded-xl hover:bg-[#5b3f8b] transition-all duration-300 shadow-md"
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
                      {" "}
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
                    className="mt-3 py-3 bg-[#7554ad] text-[#EBEBEF] font-semibold rounded-lg hover:bg-[#5b3f8b] transition-all duration-300 shadow-md"
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
          <div className="flex-grow p-2">
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
