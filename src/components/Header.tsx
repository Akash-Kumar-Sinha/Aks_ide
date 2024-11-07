import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useUserProfile from "@/utils/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Loading from "./Loading";
import { Button } from "./ui/button";
import LoginPopUp from "./LoginPopUp";

const Header = () => {
  const navigate = useNavigate();
  const { userProfile, loading } = useUserProfile();
  const [profileUrl, setProfileUrl] = useState<string | undefined>(undefined);

  const profileSettings = () => {
    navigate("/profile");
  };

  useEffect(() => {
    if (userProfile) {
      setProfileUrl(userProfile.avatar);
    }
  }, [userProfile, navigate]);

  return (
    <header className="fixed top-0 left-0 w-full px-6 h-12 bg-[#1C1D2C] border-b-2 border-[#111116] shadow-lg rounded-b-2xl flex justify-between items-center z-20">
      <h1 className="text-2xl font-bold text-[#7554ad]">Aks Ide</h1>

      {loading && <Loading size={22} />}

      {!userProfile ? (
        <Button className="bg-[#111116] hover:bg-[#1C1D2C] hover:underline text-[#B2B8C3] px-4 py-1 rounded-lg transition-transform duration-150 ease-in-out transform hover:scale-105">
          <LoginPopUp />
        </Button>
      ) : (
        <div className="flex items-center space-x-4">
          <Avatar
            onClick={profileSettings}
            className="cursor-pointer hover:opacity-90 transition-opacity duration-150"
          >
            <AvatarImage
              src={profileUrl}
              className="rounded-full border border-gray-600"
            />
            <AvatarFallback className="bg-zinc-700 text-[#EBEBEF] font-semibold">
              PF
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </header>
  );
};

export default Header;
