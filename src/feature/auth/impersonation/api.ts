// src/feature/auth/impersonation/api.ts
import { ImpersonationInfo } from "@/domain/auth";
import client from "@/lib/client/api";

export const userImpersonationApi = {
  start: async (impersonatedUsername: string): Promise<ImpersonationInfo> => {
    const res = await client.api.post<{ impersonation: ImpersonationInfo }>(
      "/api/auth/impersonation",
      { impersonatedUsername },
    );

    return res.data.impersonation;
  },

  stop: async (): Promise<null> => {
    await client.api.delete("/api/auth/impersonation");
    return null;
  },
};
