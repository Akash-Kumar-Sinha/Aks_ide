import { useRouter } from "next/navigation";
import axios from "axios";
import { AUTH_SERVICE_URL } from "@/utils/constant";
import socket from "@/utils/Socket";

export function useLogout() {
  const router = useRouter();

  return async () => {
    try {
      await axios.post(
        `${AUTH_SERVICE_URL}/api/v1/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      socket.disconnect();
      router.push("/auth");
    }
  };
}
