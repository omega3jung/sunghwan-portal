// src/feature/user/impersonation/api.ts
import client from "@/lib/api";

export const userImpersonationApi = {
  start: async (impersonatedUserId: string) => {
    const res = await client.api.post<{
      originalUserId: string;
      impersonatedUserId: string;
      activatedAt: number;
    }>("/api/auth/impersonation", {
      impersonatedUserId,
    });

    return res.data;
  },

  stop: async () => {
    await client.api.delete("/api/auth/impersonation");

    return null;
  },
};
