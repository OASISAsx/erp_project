import { create } from "zustand";
import { apiClient } from "@/lib/api";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

type AuthStoreState = {
  register: (values: RegisterPayload) => Promise<void>;
};

export const useAuthStore = create<AuthStoreState>(() => ({
  async register(values) {
    await apiClient.post("/auth/register", values);
  }
}));
