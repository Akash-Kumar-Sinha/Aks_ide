"use client";

import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/utils/apiClient";
import { AUTH_SERVICE_URL } from "@/utils/constant";

interface Profile {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar?: string;
}

interface UserProfileContextValue {
  userProfile: Profile | null;
  loading: boolean;
  error: unknown;
}

const UserProfileContext = createContext<UserProfileContextValue>({
  userProfile: null,
  loading: true,
  error: null,
});

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get(
          `${AUTH_SERVICE_URL}/api/v1/auth/me`,
        );
        if (response.status === 200) {
          const raw = response.data.profile ?? response.data;

          const id = raw.id;
          const email = raw.email;
          const username = raw.username;
          const firstName = raw.first_name ?? "";
          const lastName = raw.last_name ?? "";
          const avatar = raw.avatar;

          const name =
            [firstName, lastName].filter(Boolean).join(" ").trim() ||
            username ||
            email;

          setUserProfile({
            id,
            email,
            name,
            first_name: firstName,
            last_name: lastName,
            username,
            avatar,
          });
        }
      } catch (err) {
        console.error("[UserProfileContext] failed to fetch profile", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <UserProfileContext.Provider value={{ userProfile, loading, error }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfileContext() {
  return useContext(UserProfileContext);
}

export { UserProfileContext };
