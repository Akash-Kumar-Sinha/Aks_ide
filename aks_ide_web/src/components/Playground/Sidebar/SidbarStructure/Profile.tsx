import { SlLogout } from "react-icons/sl";
import useUserProfile from "../../../../utils/useUserProfile";
import { getAccessTokenFromLocalStorage } from "../../../../utils/getAccessTokenFromLocalStorage";
import apiClient from "../../../../utils/apiClient";
import { SERVER_URL } from "../../../../utils/constant";
import socket from "../../../../utils/Socket";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const { userProfile, loading, error } = useUserProfile();

  const handleLogout = async () => {
    try {
      const accessToken = getAccessTokenFromLocalStorage();
      const response = await apiClient.post(
        `${SERVER_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        localStorage.removeItem(import.meta.env.VITE_ACCESS_TOKEN_NAME);
        socket.disconnect();
        window.location.reload();
      }
    } catch (error) {
      console.error("Error logging out:", error);
      localStorage.removeItem(import.meta.env.VITE_ACCESS_TOKEN_NAME);
      socket.disconnect();
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#000000]">
        <div className="text-sm text-[#808080]">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-[#000000]">
        <div className="text-sm text-center text-[#f85149]">
          Error loading profile
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="h-full flex items-center justify-center p-4 bg-[#000000]">
        <div className="text-sm text-center text-[#808080]">
          No profile data available
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#000000]">
      <div className="p-4">
        {/* User Avatar and Basic Info */}
        <div className="flex items-center mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
          <Avatar className="w-12 h-12 mr-4">
            <AvatarImage src={userProfile?.avatar} />
            <AvatarFallback className="bg-[#569cd6] text-white font-semibold">
              {(userProfile?.name || userProfile?.email || "U")
                .charAt(0)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <Label className="text-[#cccccc] text-base font-semibold block truncate">
              {userProfile?.name || "No name provided"}
            </Label>
            <Label className="text-[#808080] text-sm block truncate">
              {userProfile?.email || "No email provided"}
            </Label>
          </div>
        </div>

        {/* Profile Details */}
        <div className="mb-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
          <h3 className="text-lg font-semibold mb-4 pb-3 text-[#569cd6] border-b border-[#333333]">
            Profile Information
          </h3>

          <div className="space-y-3">
            <div className="flex flex-col p-3 bg-[#000000] rounded-md border border-[#333333]">
              <Label className="text-[#808080] mb-1 text-xs font-medium uppercase tracking-wider">
                Name
              </Label>
              <span className="text-sm text-[#cccccc] font-medium">
                {userProfile?.name || "Not provided"}
              </span>
            </div>

            <div className="flex flex-col p-3 bg-[#000000] rounded-md border border-[#333333]">
              <Label className="text-[#808080] mb-1 text-xs font-medium uppercase tracking-wider">
                Email Address
              </Label>
              <span className="text-sm text-[#cccccc] font-medium break-all">
                {userProfile?.email || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4 border-t border-[#333333]">
          <Button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-all duration-200 bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-lg hover:shadow-xl border border-[#dc2626] hover:border-[#b91c1c]"
          >
            <SlLogout className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
