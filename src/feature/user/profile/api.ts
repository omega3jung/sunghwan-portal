// src/feature/user/profile/api.ts
import { AppUser } from "@/domain/user";
import client from "@/lib/api";

export const userProfileApi = {
  get: async (userId: string) => {
    const res = await client.api.get<AppUser>(`/api/users/${userId}/profile`);
    return res.data;
  },

  create: async (data: AppUser) => {
    if (!data) return;

    const res = await client.api.post(`/api/users/${data.id}/profile`, {
      data,
    });
    return res.data;
  },

  update: async (data: AppUser) => {
    if (!data) return;

    const res = await client.api.put(`/api/users/${data.id}/profile`, { data });
    return res.data;
  },

  me: async () => {
    const res = await client.api.get<AppUser>("/api/users/me");
    return res.data;
  },
};
