import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import useUserProfile from "@/utils/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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

  if (loading) return <div>Loading...</div>;
  if (!userProfile) return;
  if (error) return <div>Error fetching profile</div>;

  return (
    <div>
      <header className="fixed top-0 left-0 w-full px-4 p-2 bg-zinc-950 border-b shadow-md shadow-white z-50 rounded-b-lg flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Aks Ide</h1>
        <div className="flex items-center space-x-4">
          <Avatar onClick={profileSettings} className="cursor-pointer">
            <AvatarImage src={profileUrl} className="rounded-full" />
            <AvatarFallback className="bg-zinc-700 text-white">
              PF
            </AvatarFallback>
          </Avatar>
        </div>
      </header>
    </div>
  );
};

export default Header;
