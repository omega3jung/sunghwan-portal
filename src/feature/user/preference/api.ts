// src/feature/user/preference/api.ts
import { Preference } from "@/domain/user/preference";
import client from "@/lib/api";
import { ApiResponse } from "@/shared/types";

export const userPreferenceApi = {
  get: async <T>(userId: string, preferenceKey: string) => {
    const res = await client.api.get<ApiResponse<Preference<T> | null>>(
      `/api/users/${userId}/preference?preferenceKey=${preferenceKey}`,
    );

    return res.data.data;
  },

  create: async <T>(userId: string, data: Preference<T>) => {
    const res = await client.api.post<ApiResponse<Preference<T>>>(
      `/api/users/${userId}/preference`,
      data,
    );

    return res.data.data;
  },

  update: async <T>(userId: string, data: Preference<T>) => {
    const res = await client.api.put<ApiResponse<Preference<T>>>(
      `/api/users/${userId}/preference`,
      data,
    );

    return res.data.data;
  },

  me: {
    get: async <T>(preferenceKey: string) => {
      const res = await client.api.get<ApiResponse<Preference<T> | null>>(
        `/api/users/me/preference?preferenceKey=${preferenceKey}`,
      );
      return res.data.data;
    },

    create: async <T>(data: Preference<T>) => {
      const res = await client.api.post<ApiResponse<Preference<T>>>(
        "/api/users/me/preference",
        data,
      );

      return res.data.data;
    },

    update: async <T>(data: Preference<T>) => {
      const res = await client.api.put<ApiResponse<Preference<T>>>(
        "/api/users/me/preference",
        data,
      );

      return res.data.data;
    },
  },
};
