// src/feature/user/preference/api.ts
import client from "@/api/client";
import { Preference } from "@/domain/config";

export const userPreferenceApi = {
  fetch: async (userId: string) => {
    const res = await client.api.get<Preference>(
      `/api/users/${userId}/preference`,
    );

    return res.data;
  },

  post: async (userId: string, data: Preference) => {
    const res = await client.api.post<Preference>(
      `/api/users/${userId}/preference`,
      data,
    );

    return res.data;
  },

  put: async (userId: string, data: Preference) => {
    const res = await client.api.put<Preference>(
      `/api/users/${userId}/preference`,
      data,
    );

    return res.data;
  },
};
