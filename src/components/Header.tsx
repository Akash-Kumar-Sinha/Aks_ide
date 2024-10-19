import { useNavigate } from "react-router-dom";

import useUserProfile from "@/utils/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Header = () => {
  const navigate = useNavigate();
  const { userProfile } = useUserProfile();

  if (!userProfile) {
    console.log("Unable to fetch the user profile");
  }

  const profileSettings = () => {
    navigate("/profile");
  };

  const profileUrl = userProfile?.avatar;

  return (
    <div>
      <header className="bg-zinc-800 text-white p-4 rounded-b-2xl flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <Avatar onClick={profileSettings} className="cursor-pointer">
          <AvatarImage src={profileUrl} />
          <AvatarFallback className="bg-zinc-900">PF</AvatarFallback>
        </Avatar>
      </header>
    </div>
  );
};

export default Header;
