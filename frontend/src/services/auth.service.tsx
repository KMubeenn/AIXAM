import { User } from "../store/useAuthStore";
import { api } from "./api";

export interface AuthResponse {
  message?: string;
  token: string;
  user: User;
}

export const AuthService = {
  async signup(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/signup/", userData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/login/",
        credentials,
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async getProfile(): Promise<{ user: User }> {
    try {
      const response = await api.get<{ user: User }>("/auth/me/");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async deleteAccount(): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>("/auth/me/delete/");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
