import axios from "axios";
import { AUTH_SERVICE_URL } from "@/utils/constant";

const apiClient = axios.create({
  baseURL: AUTH_SERVICE_URL,
  withCredentials: true,
});

let refreshInFlight: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if ((status === 401 || status === 403) && !original._retry) {
      original._retry = true;

      try {
        if (!refreshInFlight) {
          refreshInFlight = axios
            .post(
              `${AUTH_SERVICE_URL}/api/v1/auth/oauth/refresh`,
              {},
              { withCredentials: true },
            )
            .then(() => {
              refreshInFlight = null;
            })
            .catch((err) => {
              refreshInFlight = null;
              throw err;
            });
        }

        await refreshInFlight;
        return apiClient(original);
      } catch {
        // Let page-level AuthProtect handle the redirect — redirecting here
        // fires even on public pages like the landing page.
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
