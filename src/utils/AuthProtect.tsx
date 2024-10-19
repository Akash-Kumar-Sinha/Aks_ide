import React, { ReactNode, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

interface AuthProtectProps {
  children: ReactNode;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const AuthProtect: React.FC<AuthProtectProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const verifyToken = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/auth/verify_token`, {
          withCredentials: true,
        });

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
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthProtect;
