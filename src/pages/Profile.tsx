import { useRef, useState } from "react";
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
import Back from "@/components/Back";
import Loading from "@/components/Loading";
import apiClient from "@/utils/apiClient";
import { getAccessTokenFromLocalStorage } from "@/utils/getAccessTokenFromLocalStorage";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Profile = () => {
  const { userProfile, loading, error } = useUserProfile();
  const [nameStatus, setNameStatus] = useState(false);
  const userName = useRef<HTMLInputElement>(null);

  const changeName = async () => {
    const accessToken = getAccessTokenFromLocalStorage();
    const name = userName.current?.value;

    const response = await apiClient.put(
      `${SERVER_URL}/auth/update_name`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 200) {
      console.log("Name changed successfully");
      setNameStatus(true);
    }
  };

  if (error) return <div>Error fetching profile</div>;

  return (
    <div className="h-full">
      {loading ? (
        <div className="h-screen flex justify-center items-center">
          <Loading />
        </div>
      ) : (
        <>
          <div className="px-4 py-4 fixed m-4 mt-11 ">
            <Back size={22} />
          </div>
          <div className="min-h-screen flex flex-col justify-center items-center">
            <div className="bg-white p-8 shadow-lg rounded-3xl w-full max-w-lg flex flex-col items-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                User Profile
              </h1>
              {userProfile ? (
                <div className="w-full">
                  <div className="flex flex-col gap-6 text-left bg-gray-100 p-6 rounded-xl shadow-md">
                    <p className="text-gray-700 flex items-center justify-between">
                      <span className="text-lg">
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
                                placeholder="Enter Your New Name"
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
                    <p className="text-gray-700 text-lg">
                      <strong className="text-gray-900">Email:</strong>{" "}
                      {userProfile.email}
                    </p>
                    <p className="text-gray-700 text-lg">
                      <strong className="text-gray-900">User ID:</strong>{" "}
                      {userProfile.id}
                    </p>
                    <p className="text-gray-700 text-lg">
                      <strong className="text-gray-900">Created At:</strong>{" "}
                      {new Date(userProfile.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No user profile found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
