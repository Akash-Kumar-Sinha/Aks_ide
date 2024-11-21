import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useUserProfile from "@/utils/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import Loading from "./Loading";
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
  }, [userProfile]);

  return (
    <header className="w-full px-4 h-12 bg-zinc-950 shadow flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-bold text-purple-600">Aks IDE</h1>
        </div>
      </div>

      {loading ? (
        <Loading size={22} />
      ) : !userProfile ? (
        <Button className="bg-[#2e2f3e] hover:bg-[#3c3e4f] text-[#b2b8c3] px-4 py-1 rounded-md transition">
          <LoginPopUp />
        </Button>
      ) : (
        <div className="flex items-center justify-center space-x-4">
          <Avatar
            onClick={profileSettings}
            className="cursor-pointer hover:opacity-90 transition-opacity duration-150"
          >
            <AvatarImage
              src={profileUrl}
              className="w-8 h-8 rounded-full border border-gray-600"
            />
            <AvatarFallback className="bg-gray-700 text-white font-semibold">
              PF
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </header>
  );
};

export default Header;
