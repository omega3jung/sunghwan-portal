// src/feature/user/impersonation/api.ts
import fetcher from "@/services/fetcher";

export const userImpersonationApi = {
  start: async (subjectId: string) => {
    const res = await fetcher.api.post<{
      actorId: string;
      subjectId: string;
      activatedAt: number;
    }>("/api/auth/impersonation", {
      subjectId,
    });

    return res.data;
  },

  stop: async () => {
    await fetcher.api.delete("/api/auth/impersonation");

    return null;
  },
};
