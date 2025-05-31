import React, { type ReactNode, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import apiClient from "./apiClient";
import { getAccessTokenFromLocalStorage } from "./getAccessTokenFromLocalStorage";
import { Loading } from "../components/ui/Loading/Loading";

interface AuthProtectProps {
  children: ReactNode;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const AuthProtect: React.FC<AuthProtectProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const verifyToken = async () => {
      const accessToken = getAccessTokenFromLocalStorage();
      try {

        const response = await apiClient.get(
          `${SERVER_URL}/auth/verify_token`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            withCredentials: true,
          }
        );

        if (response.status === 200 && response.data.authorized) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.message);
        } else {
          console.error("Unexpected error:", error);
        }
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [navigate]);

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/repo" replace />;
  }

  return <>{children}</>;
};

export default AuthProtect;
