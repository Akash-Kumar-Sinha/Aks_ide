import { Avatar } from "../../../ui/Avatar/Avatar";
import useTheme from "../../../ui/lib/useTheme";
import { SlLogout } from "react-icons/sl";
import { Button } from "../../../ui/Button/Button";
import { Label } from "../../../ui/Label/Label";
import useUserProfile from "../../../../utils/useUserProfile";
import { getAccessTokenFromLocalStorage } from "../../../../utils/getAccessTokenFromLocalStorage";
import apiClient from "../../../../utils/apiClient";
import { SERVER_URL } from "../../../../utils/constant";
import socket from "../../../../utils/Socket";

const Profile = () => {
  const { theme } = useTheme();
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
      <div
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div className="text-sm" style={{ color: theme.textDimmed }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="h-full flex items-center justify-center p-4"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div
          className="text-sm text-center"
          style={{ color: theme.errorColor }}
        >
          Error loading profile
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div
        className="h-full flex items-center justify-center p-4"
        style={{ backgroundColor: theme.backgroundColor }}
      >
        <div
          className="text-sm text-center"
          style={{ color: theme.textDimmed }}
        >
          No profile data available
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <Avatar
            image={userProfile?.avatar}
            fallback={userProfile?.name || userProfile?.email || "User"}
            variant="default"
            scale="lg"
            className="mr-4"
          />
          <div className="flex-1">
            <Label scale="xl">{userProfile?.name || "No name provided"}</Label>
            <Label dimmed scale="sm">
              {userProfile?.email || "No email provided"}
            </Label>
          </div>
        </div>

        <div className="mb-8">
          <h3
            className="text-lg font-medium mb-4 pb-2"
            style={{
              color: theme.primaryColor,
              borderBottom: `1px solid ${theme.secondaryColor}`,
            }}
          >
            Profile Information
          </h3>

          <div className="space-y-4">
            <div className="flex flex-col ">
              <Label scale="lg">Name</Label>
              <span className="text-sm" style={{ color: theme.textDimmed }}>
                {userProfile?.name || "Not provided"}
              </span>
            </div>

            <div className="flex flex-col ">
              <Label scale="lg">Email Address</Label>
              <span className="text-sm" style={{ color: theme.textDimmed }}>
                {userProfile?.email || "Not provided"}
              </span>
            </div>
          </div>
        </div>

        <div
          className="pt-6"
          style={{ borderTop: `1px solid ${theme.secondaryColor}` }}
        >
          <Button
            value="logout"
            Icon={SlLogout}
            iconPosition="right"
            onClick={handleLogout}
            className="flex items-center justify-center w-full py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
            style={{
              backgroundColor: theme.errorColor,
              color: theme.backgroundColor,
              border: "none",
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
