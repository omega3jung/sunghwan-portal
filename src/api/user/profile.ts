// src/feature/user/profile/api.ts
import client from "@/api/client";
import { AppUser } from "@/domain/user";

export const userProfileApi = {
  fetch: async (userId: string) => {
    const res = await client.api.get<AppUser>(`/api/users/${userId}/profile`);

    return res.data;
  },

  post: async (data: AppUser) => {
    if (!data) return;

    const res = await client.api.post(`/api/users/${data.id}/profile`, {
      data,
    });

    return res.data;
  },

  put: async (data: AppUser) => {
    if (!data) return;

    const res = await client.api.put(`/api/users/${data.id}/profile`, {
      data,
    });

    return res.data;
  },

  me: async () => {
    const res = await client.api.get<AppUser>("/api/users/me");

    return res.data;
  },
};
