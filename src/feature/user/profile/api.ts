// src/feature/user/profile/api.ts
import { AppUser } from "@/domain/user";
import client from "@/lib/api";
import { ApiResponse } from "@/shared/types";

export const userProfileApi = {
  get: async (userId: string) => {
    const res = await client.api.get<ApiResponse<AppUser> | AppUser>(
      `/api/users/${userId}/profile`,
    );
    return normalizeProfileResponse(res.data);
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
    const res = await client.api.get<ApiResponse<AppUser> | AppUser>(
      "/api/users/me/profile",
    );
    return normalizeProfileResponse(res.data);
  },
};

function normalizeProfileResponse(
  payload: ApiResponse<AppUser> | AppUser,
): AppUser {
  if ("data" in payload && payload.data) {
    return payload.data;
  }

  return payload as AppUser;
}
