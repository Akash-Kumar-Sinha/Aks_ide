import { Link } from "react-router-dom";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface RepoProps {
  label: string;
  title: string;
  description: string;
  refLink: string;
}

const Repo: React.FC<RepoProps> = ({ label, description, refLink, title }) => {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 p-4">
      <Card className="shadow-lg transition-transform transform hover:scale-105 h-full flex flex-col border border-gray-300 rounded-3xl bg-white">
        <CardHeader className="p-4">
          <CardTitle className="text-xl font-semibold text-gray-800">
            {label}
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {description}
          </CardDescription>
        </CardHeader>

        <div className="mt-auto bg-gray-100">
          <CardContent className="p-4 border-t border-gray-300 flex flex-col">
            <p className="text-sm font-bold text-gray-700 flex items-center justify-between">
              Start with {title}:
              <Dialog>
                <DialogTrigger className="bg-[#593CA1] text-white hover:bg-[#442d7d] transition duration-200 rounded-xl px-4 py-2 shadow-lg">
                  Create
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Your {title} Template</DialogTitle>
                    <DialogDescription className="m-2 flex flex-col gap-4">
                      <Input
                        placeholder="Enter Template Name"
                        className="text-gray-800 rounded-2xl"
                      />
                      <Input
                        value={title}
                        disabled
                        className="text-zinc-950 bg-gray-200 rounded-2xl"
                      />
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-[#442d7d] hover:bg-[#593CA1] text-white rounded-xl"
                    >
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </p>
          </CardContent>
        </div>
        <CardFooter className="p-4 border-t border-gray-300 bg-zinc-200 rounded-b-3xl ">
          <Link to={refLink} className="w-full">
            <Button className="w-full text-white bg-[#593CA1] hover:bg-[#442d7d] transition duration-200 rounded-xl px-4 py-2 shadow-lg">
              Learn More
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Repo;
