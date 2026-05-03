import axios from "axios";
import { signOut } from "next-auth/react";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

export function getAuthHeaders(accessToken?: string) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;
}

let isRedirectingToLogin = false;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401 && typeof window !== "undefined" && !isRedirectingToLogin) {
      isRedirectingToLogin = true;
      const callbackUrl = `${window.location.pathname}${window.location.search}`;

      await signOut({
        redirect: true,
        callbackUrl: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
      });
    }

    return Promise.reject(error);
  }
);
