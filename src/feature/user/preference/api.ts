// src/feature/user/preference/api.ts
import fetcher from "@/services/fetcher";
import { Preference } from "@/types";

export const userPreferenceApi = {
  fetch: async (userId: string) => {
    const res = await fetcher.api.get<Preference>(
      `/api/user/${userId}/preference`
    );

    return res.data;
  },

  post: async (userId: string, data: Preference) => {
    const res = await fetcher.api.post<Preference>(
      `/api/user/${userId}/preference`,
      data
    );

    return res.data;
  },

  put: async (userId: string, data: Preference) => {
    const res = await fetcher.api.put<Preference>(
      `/api/user/${userId}/preference`,
      data
    );

    return res.data;
  },
};
