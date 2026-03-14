// src/feature/user/preference/repo.ts

import { userPreferenceApi } from "@/api/user";
import { Preference } from "@/domain/config";

export const userPreferenceRepo = {
  async get(userId: string | null): Promise<Preference> {
    // local demo.
    if (!userId) {
      const raw = localStorage.getItem("sunghwan_portal_user_preference");

      // Return preference from local storage if exists.
      if (raw) return JSON.parse(raw);

      throw new Error("User preference not found (demo)");
    }

    return userPreferenceApi.get(userId);
  },

  async create({ userId, data }: { userId: string | null; data: Preference }) {
    // local demo.
    if (!userId) {
      localStorage.setItem(
        "sunghwan_portal_user_preference",
        JSON.stringify(data),
      );
      return;
    }

    const result = await userPreferenceApi.create(userId, data);

    return result;
  },

  async update({ userId, data }: { userId: string | null; data: Preference }) {
    // local demo.
    if (!userId) {
      localStorage.setItem(
        "sunghwan_portal_user_preference",
        JSON.stringify(data),
      );
      return;
    }

    const result = await userPreferenceApi.update(userId, data);

    return result;
  },
};
