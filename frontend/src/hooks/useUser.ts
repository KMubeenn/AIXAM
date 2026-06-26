import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  role: "student" | "teacher" | "admin";
  google_connected: boolean;
  google_email: string | null;
}

export const useProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await api.get("/auth/profile/");
      return response.data;
    },
  });
};
