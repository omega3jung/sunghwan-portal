// src/feature/user/preference/repo.ts
import { Preference } from "@/types";

import { userPreferenceApi } from "./api";

export const userPreferenceRepo = {
  async fetch(userId: string | null): Promise<Preference> {
    // local demo.
    if (!userId) {
      const raw = localStorage.getItem("sunghwan_portal_user_preference");

      // Return preference from local storage if exists.
      if (raw) return JSON.parse(raw);

      throw new Error("User preference not found (demo)");
    }

    return userPreferenceApi.fetch(userId);
  },

  async post({ userId, data }: { userId: string | null; data: Preference }) {
    // local demo.
    if (!userId) {
      localStorage.setItem(
        "sunghwan_portal_user_preference",
        JSON.stringify(data)
      );
      return;
    }

    const result = await userPreferenceApi.post(userId, data);

    return result;
  },

  async put({ userId, data }: { userId: string | null; data: Preference }) {
    // local demo.
    if (!userId) {
      localStorage.setItem(
        "sunghwan_portal_user_preference",
        JSON.stringify(data)
      );
      return;
    }

    const result = await userPreferenceApi.put(userId, data);

    return result;
  },
};
