import { Link, useNavigate } from "react-router-dom";
import React, { useRef } from "react";
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
import axios from "axios";
import { RepositoryInfo } from "@/utils/types/types";
import useUserProfile from "@/utils/useUserProfile";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface RepoProps {
  label: string;
  title: string;
  description: string;
  refLink: string;
}

const Repo: React.FC<RepoProps> = ({ label, description, refLink, title }) => {
  const navigate = useNavigate();
  const { userProfile, loading } = useUserProfile();

  const templateName = useRef<HTMLInputElement>(null);

  const techStack = useRef<HTMLInputElement>(null);

  const createTemplate = async () => {
    try {
      const data = {
        templateName: templateName.current?.value,
        techStack: techStack.current?.value,
      };
      const response = await axios.post(`${SERVER_URL}/repo/template`, data, {
        withCredentials: true,
      });
      if (response.status === 200) {
        const repoInfo = response.data.Repository as RepositoryInfo;
        navigate(`/repo/${repoInfo.id}`, { state: repoInfo });
      }
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };
  if (loading) return <div>Loading...</div>;

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
                {!userProfile ? (
                  <DialogContent className="mb-6 text-center">
                    <Link to="/" className="text-blue-400 hover:underline">
                      Not logged in. Please log in to access all features.
                    </Link>
                  </DialogContent>
                ) : (
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="m-2 mb-4 text-center">
                        Create Your {title} Template
                      </DialogTitle>
                      <DialogDescription className="m-2 flex flex-col gap-4">
                        <Input
                          ref={templateName}
                          placeholder="Enter Template Name"
                          className="text-gray-800 rounded-2xl"
                        />
                        <Input
                          ref={techStack}
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
                        onClick={createTemplate}
                      >
                        Create
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                )}
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
