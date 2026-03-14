// src/feature/user/preference/api.ts
import client from "@/api/client";
import { Preference } from "@/domain/config";

export const userPreferenceApi = {
  get: async (userId: string) => {
    const res = await client.api.get<Preference>(
      `/api/users/${userId}/preference`,
    );

    return res.data;
  },

  create: async (userId: string, data: Preference) => {
    const res = await client.api.post<Preference>(
      `/api/users/${userId}/preference`,
      data,
    );

    return res.data;
  },

  update: async (userId: string, data: Preference) => {
    const res = await client.api.put<Preference>(
      `/api/users/${userId}/preference`,
      data,
    );

    return res.data;
  },
};
