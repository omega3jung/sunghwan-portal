// src/feature/user/impersonation/api.ts
import { ImpersonationInfo } from "@/domain/auth";
import client from "@/lib/api";

export const userImpersonationApi = {
  start: async (impersonatedUsername: string) => {
    const res = await client.api.post<{
      impersonation: ImpersonationInfo;
    }>("/api/auth/impersonation", {
      impersonatedUsername,
    });

    return res.data;
  },

  stop: async () => {
    await client.api.delete("/api/auth/impersonation");

    return null;
  },
};
