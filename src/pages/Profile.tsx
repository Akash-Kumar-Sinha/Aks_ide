import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useUserProfile from "@/utils/useUserProfile";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const Profile = () => {
  const { userProfile, loading, error } = useUserProfile();
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching profile</div>;

  return (
    <div className="h-full flex flex-col justify-center items-center">
      <div className="bg-white p-8 shadow-lg rounded-2xl w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>
        {userProfile ? (
          <div className="w-full">
            <div className="flex flex-col gap-4 text-left">
              <p className="text-gray-700">
                <strong className="text-gray-900">Name:</strong>{" "}
                {userProfile.name}
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
              className="mt-6 w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all duration-300"
            >
              Logout
            </Button>
          </div>
        ) : (
          <p className="text-gray-500">No user profile found</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
