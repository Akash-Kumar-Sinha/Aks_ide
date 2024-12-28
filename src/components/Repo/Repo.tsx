import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

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
import { RepositoryInfo } from "@/utils/types/types";
import useUserProfile from "@/utils/useUserProfile";
import Loading from "../Loading";
import apiClient from "@/utils/apiClient";
import { getAccessTokenFromLocalStorage } from "@/utils/getAccessTokenFromLocalStorage";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Repo = () => {
  const navigate = useNavigate();
  const { userProfile, loading } = useUserProfile();
  const templateName = useRef<HTMLInputElement>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const createTemplate = async () => {
    setLoadingStatus(true);
    try {
      if (!templateName.current) return;
      const accessToken = getAccessTokenFromLocalStorage();

      const name = templateName.current.value.trim();
      if (!name) {
        console.error("Template name is required.");
        return;
      }

      const response = await apiClient.post(`${SERVER_URL}/repo/template`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        templateName: name,
      });

      if (response.status === 200) {
        const repoInfo = response.data.Repository as RepositoryInfo;
        navigate(`/repo/${repoInfo.id}`, { state: repoInfo });
      }
    } catch (error) {
      console.error("Error creating template:", error);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <motion.div
      className="text-center flex flex-col items-center justify-center bg-zinc-950 h-full"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {loading || loadingStatus ? (
        <Loading />
      ) : (
        <>
          <h1 className="text-4xl font-serif font-bold text-gray-400 mb-4">
            Create Your Coding Template
          </h1>
          <p className="text-gray-500 text-lg mb-4">
            Use our templates to jumpstart your coding projects. Create,
            customize, and code with ease!
          </p>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="min-w-1/3 w-2/3"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white shadow-lg h-full flex flex-col border border-gray-200 rounded-lg">
                <CardHeader className="p-6 bg-zinc-100 rounded-t-lg">
                  <CardTitle className="text-2xl font-serif font-semibold text-gray-800">
                    Start coding with just one click
                  </CardTitle>
                  <CardDescription className="text-gray-600 mt-2">
                    Experience seamless coding with Aks IDE, designed to enhance
                    your workflow by offering support for multiple languages and
                    frameworks, making your coding experience both efficient and
                    enjoyable.
                  </CardDescription>
                </CardHeader>

                <div className="mt-auto">
                  <CardContent className="p-4 flex flex-col">
                    <Dialog>
                      <DialogTrigger>
                        <motion.button
                          className="w-full border border-[#593CA1] bg-[#593CA1] text-white font-semibold rounded-xl px-6 py-3 shadow-md transition-transform duration-200 hover:scale-105"
                          whileHover={{
                            scale: 1.05,
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          Start
                        </motion.button>
                      </DialogTrigger>
                      {!userProfile ? (
                        <DialogContent className="mb-6 text-center">
                          <Link
                            to="/"
                            className="text-blue-600 hover:underline"
                          >
                            Not logged in. Please log in to access all features.
                          </Link>
                        </DialogContent>
                      ) : (
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="m-2 mb-4 text-center">
                              Create Your Template
                            </DialogTitle>
                            <DialogDescription className="m-2 flex flex-col gap-4">
                              <Input
                                ref={templateName}
                                placeholder="Enter Template Name"
                                className="text-gray-800 rounded-xl border border-gray-300"
                              />
                              <p className="text-gray-500 text-sm">
                                (Choose a descriptive name for your template)
                              </p>
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              type="button"
                              className="bg-[#442d7d] hover:bg-[#593CA1] text-white rounded-xl px-6 py-2 shadow-lg"
                              onClick={createTemplate}
                            >
                              Create
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                  </CardContent>
                </div>
                <CardFooter className="p-4 border-t border-gray-200 bg-zinc-100 rounded-b-lg"></CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default Repo;
