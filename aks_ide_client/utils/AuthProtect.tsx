"use client";

import React, { type ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loading } from "@/components/ui/Loading/Loading";
import { AUTH_SERVICE_URL } from "@/utils/constant";

interface AuthProtectProps {
  children: ReactNode;
}

const AuthProtect: React.FC<AuthProtectProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await axios.get(
          `${AUTH_SERVICE_URL}/api/v1/auth/me`,
          { withCredentials: true }
        );
        setIsAuthenticated(response.status === 200);
      } catch {
        setIsAuthenticated(false);
      }
    };
    verify();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated === null) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthProtect;
