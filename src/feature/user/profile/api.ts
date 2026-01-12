// src/feature/user/profile/api.ts
import fetcher from "@/services/fetcher";
import { AppUser } from "@/types";

export const userProfileApi = {
  fetch: async (userId: string) => {
    const res = await fetcher.api.get<AppUser>(`/api/user/${userId}/profile`);

    return res.data;
  },

  post: async (data: AppUser) => {
    if (!data) return;

    const res = await fetcher.api.post(`/api/user/${data.id}/profile`, {
      data,
    });

    return res.data;
  },

  put: async (data: AppUser) => {
    if (!data) return;

    const res = await fetcher.api.put(`/api/user/${data.id}/profile`, {
      data,
    });

    return res.data;
  },

  me: async () => {
    const res = await fetcher.api.get<AppUser>("/api/user-profile/me");

    return res.data;
  },
};
