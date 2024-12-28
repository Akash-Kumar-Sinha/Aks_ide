import axios from "axios";
import { getAccessTokenFromLocalStorage } from "./getAccessTokenFromLocalStorage";

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const apiClient = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessTokenFromLocalStorage();
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${SERVER_URL}/auth/refresh_access_token`,
          {},
          {
            withCredentials: true,
          }
        );
        localStorage.setItem(
          import.meta.env.VITE_ACCESS_TOKEN_NAME,
          data.accessToken
        );

        originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
