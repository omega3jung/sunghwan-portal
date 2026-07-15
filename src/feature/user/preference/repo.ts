// src/feature/user/preference/repo.ts

import { Preference } from "@/domain/user/preference";

import { userPreferenceApi } from "./api";
import { GetPreferenceInput, SavePreferenceInput } from "./types";

export const userPreferenceRepo = {
  async get<T>({
    userId = null,
    isRemote,
    preferenceKey,
  }: GetPreferenceInput): Promise<Preference<T> | null> {
    // local demo.
    if (!isRemote) {
      const raw = localStorage.getItem("sunghwan_portal_user_preference");

      // Return preference from local storage if exists.
      if (raw) return JSON.parse(raw);

      throw new Error("User preference not found (demo)");
    }

    // remote.
    return userId
      ? userPreferenceApi.get(userId, preferenceKey)
      : userPreferenceApi.me.get(preferenceKey);
  },

  async create<T>({ userId = null, isRemote, data }: SavePreferenceInput<T>) {
    // local demo.
    if (!isRemote) {
      localStorage.setItem(
        "sunghwan_portal_user_preference",
        JSON.stringify(data),
      );
      return;
    }

    // remote.
    const result = userId
      ? await userPreferenceApi.create(userId, data)
      : userPreferenceApi.me.create(data);

    return result;
  },

  async update<T>({ userId = null, isRemote, data }: SavePreferenceInput<T>) {
    // local demo.
    if (!isRemote) {
      localStorage.setItem(
        "sunghwan_portal_user_preference",
        JSON.stringify(data),
      );
      return;
    }

    // remote.
    const result = userId
      ? await userPreferenceApi.update(userId, data)
      : userPreferenceApi.me.update(data);

    return result;
  },
};
