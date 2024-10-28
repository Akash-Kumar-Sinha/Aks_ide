import axios from "axios";
import { useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useUserProfile from "@/utils/useUserProfile";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import Back from "@/components/Back";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Profile = () => {
  const { userProfile, loading, error } = useUserProfile();
  const [nameStatus, setNameStatus] = useState(false);
  const userName = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        console.log("Logging out...");
        navigate("/");
      } else {
        console.log("Logout failed");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const changeName = async () => {
    const name = userName.current?.value;

    const response = await axios.put(
      `${SERVER_URL}/auth/update_name`,
      { name },
      { withCredentials: true }
    );

    if (response.status === 200) {
      console.log("Name changed successfully");
      setNameStatus(true);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching profile</div>;

  return (
    <div className="h-full">
      <div className="px-4">
        <Back />
      </div>
      <div className="min-h-screen flex flex-col justify-center items-center bg-zinc-950">
        <div className="bg-white p-8 shadow-lg rounded-3xl w-full max-w-md flex flex-col items-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            User Profile
          </h1>
          {userProfile ? (
            <div className="w-full">
              <div className="flex flex-col gap-4 text-left bg-gray-100 p-4 rounded-xl">
                <p className="text-gray-700 flex items-center justify-between">
                  <span>
                    <strong className="text-gray-900">Name:</strong>{" "}
                    {userProfile.name}
                  </span>
                  <Dialog>
                    <DialogTrigger className="bg-[#593CA1] text-white hover:bg-[#442d7d] transition duration-200 rounded-xl px-4 py-2 shadow-lg">
                      <CiEdit />
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="m-4 mb-6 text-center flex flex-col">
                          <h2 className="text-2xl font-semibold text-gray-800">
                            Change Your Name
                          </h2>
                          <span className="mt-2 text-sm text-blue-600">
                            {nameStatus
                              ? "Name changed successfully! Try refreshing the page"
                              : ""}
                          </span>
                        </DialogTitle>

                        <DialogDescription className="m-2 flex flex-col gap-4">
                          <Input
                            ref={userName}
                            placeholder="Enter Template Name"
                            className="text-gray-800 rounded-2xl"
                          />
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            Close
                          </Button>
                        </DialogClose>
                        <Button
                          type="submit"
                          className="bg-[#442d7d] hover:bg-[#593CA1] text-white rounded-xl"
                          onClick={changeName}
                        >
                          Save
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Email:</strong>{" "}
                  {userProfile.email}
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">User ID:</strong>{" "}
                  {userProfile.id}
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Created At:</strong>{" "}
                  {new Date(userProfile.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                onClick={handleLogout}
                className="mt-6 w-full py-3 bg-[#593CA1] text-white font-semibold rounded-2xl hover:bg-[#442d7d] transition-all duration-300 shadow-lg"
              >
                Logout
              </Button>
            </div>
          ) : (
            <p className="text-gray-500">No user profile found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
