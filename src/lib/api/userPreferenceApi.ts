// lib/api/userPreferenceApi.ts
import { Preference } from "@/types";

export const USER_PREFERENCE_KEY = "USER-PREFERENCE";

export const userPreferenceApi = {
  fetch: async (): Promise<Preference> => {
    const res = await fetch("/api/user-preference");
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  },

  post: async (data: Preference) => {
    const res = await fetch("/api/user-preference", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },

  put: async (data: Preference) => {
    const res = await fetch("/api/user-preference", {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    return res.json();
  },
};
