import { ImpersonationInfo } from "@/domain/auth";
import client from "@/lib/client/api";
import type { ApiResponse } from "@/shared/types";

import type { EligibleImpersonationEmployeeDto } from "./dto";

export const userImpersonationApi = {
  listEligibleEmployees: async (
    companyId: string | number,
  ): Promise<EligibleImpersonationEmployeeDto[]> => {
    const res = await client.api.get<
      ApiResponse<EligibleImpersonationEmployeeDto[]>,
      { companyId: string | number }
    >("/api/auth/impersonation/employees", {
      params: { companyId },
    });

    return res.data.data;
  },

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
