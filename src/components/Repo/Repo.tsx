import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface RepoProps {
  label: string;
  title: string;
  description: string;
  refLink: string;
}

const Repo: React.FC<RepoProps> = ({ label, description, refLink, title }) => {
  return (
    <div className="w-full md:w-1/2 lg:w-1/3 p-4">
      <Card className="shadow-lg transition-transform transform hover:scale-105 h-full flex flex-col">
        <CardHeader className="p-3">
          <CardTitle className="text-lg font-semibold">{label}</CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            {description}
          </CardDescription>
        </CardHeader>

        <div className="mt-auto">
          <CardContent className="p-4 flex-grow border-t border-zinc-300">
            <p className="text-sm font-bold flex items-center justify-between">
              Start with {title}:
              <Link to="#">{title}</Link>
            </p>
          </CardContent>

          <CardFooter className="p-4 border-t border-zinc-300 mt-auto">
          <Link to={refLink} className="w-full">
            <Button className="w-full text-white transition duration-200">
              Learn more
            </Button>
          </Link>
        </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default Repo;