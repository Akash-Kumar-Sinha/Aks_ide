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
  if (error) return <div>Error fetching profile</div>;

  return (
    <div>
      <header className="bg-zinc-800 text-white p-4 rounded-b-2xl flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Aks Ide</h1>
        <Avatar onClick={profileSettings} className="cursor-pointer">
          <AvatarImage src={profileUrl} />
          <AvatarFallback className="bg-zinc-900">PF</AvatarFallback>
        </Avatar>
      </header>
    </div>
  );
};

export default Header;
