// src/feature/user/impersonation/api.ts
import client from "@/api/client";

export const userImpersonationApi = {
  start: async (subjectId: string) => {
    const res = await client.api.post<{
      actorId: string;
      subjectId: string;
      activatedAt: number;
    }>("/api/auth/impersonation", {
      subjectId,
    });

    return res.data;
  },

  stop: async () => {
    await client.api.delete("/api/auth/impersonation");

    return null;
  },
};
