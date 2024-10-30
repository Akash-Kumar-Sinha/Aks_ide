import { useState, useEffect } from "react";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

interface Profile {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    avatar: string;
    userId: string;
  }

const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/auth/user_profile`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUserProfile(response.data.user);
      } else {
        console.log("Failed to fetch user profile");
      }
    } catch (error: unknown) {
      console.error("Error fetching user profile:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return { userProfile, loading, error };
};

export default useUserProfile;
