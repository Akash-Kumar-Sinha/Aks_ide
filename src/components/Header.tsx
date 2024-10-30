import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useUserProfile from "@/utils/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Loading from "./Loading";

const Header = () => {
  const navigate = useNavigate();
  const { userProfile, loading, error } = useUserProfile();
  const [profileUrl, setProfileUrl] = useState<string | undefined>(undefined);

  const profileSettings = () => {
    navigate("/profile");
  };

  useEffect(() => {
    if (userProfile) {
      setProfileUrl(userProfile.avatar);
    }
  }, [userProfile]);

  if (!userProfile) return null;
  if (error) return <div className="text-red-500">Error fetching profile</div>;

  return (
    <header className="fixed top-0 left-0 w-full px-4 h-14 bg-zinc-900 border-b border-gray-700 shadow-lg z-50 flex justify-between items-center">
      {loading ? (
        <div className="w-full flex justify-center items-center">
          <Loading size={50} />
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-white">Aks Ide</h1>
          <div className="flex items-center space-x-4">
            <Avatar onClick={profileSettings} className="cursor-pointer">
              <AvatarImage src={profileUrl} className="rounded-full" />
              <AvatarFallback className="bg-zinc-700 text-white">
                PF
              </AvatarFallback>
            </Avatar>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
