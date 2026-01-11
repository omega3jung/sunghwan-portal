// lib/api/userProfileApi.ts
import { AppUser } from "@/types";

export const USER_PROFILE_KEY = "USER-PROFILE";

export const userProfileApi = {
  fetch: async (userId: string): Promise<AppUser> => {
    const res = await fetch(`/api/user-profile/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  },

  post: async (data: AppUser) => {
    const res = await fetch("/api/user-profile", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: AppUser) => {
    const res = await fetch("/api/user-profile", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  me: async (): Promise<AppUser> => {
    const res = await fetch("/api/user-profile/me");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  },
};
