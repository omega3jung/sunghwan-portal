// lib/repo/userPreferenceRepo.ts
import { userPreferenceApi } from "@/lib/api/userPreferenceApi";
import { useSessionStore } from "@/lib/sessionStore";
import { Preference } from "@/types";

export const USER_PREFERENCE_KEY = "USER-PREFERENCE";

export const userPreferenceRepo = {
  async fetch(userId?: string) {
    const { dataScope } = useSessionStore.getState();

    if (dataScope === "LOCAL") {
      const raw = localStorage.getItem("sunghwan_portal_user_preference");

      // Return preference from local storage if exists.
      if (raw) return JSON.parse(raw);
    }

    return userPreferenceApi.fetch(userId);
  },

  async post(data: Preference) {
    const { dataScope } = useSessionStore.getState();

    if (dataScope === "LOCAL") {
      localStorage.setItem(
        "sunghwan_portal_user_preference",
        JSON.stringify(data)
      );
      return;
    }

    const result = await userPreferenceApi.post(data);

    return result;
  },

  async put(data: Preference) {
    const { dataScope } = useSessionStore.getState();

    if (dataScope === "LOCAL") {
      localStorage.setItem(
        "sunghwan_portal_user_preference",
        JSON.stringify(data)
      );
      return;
    }

    const result = await userPreferenceApi.put(data);

    return result;
  },
};
