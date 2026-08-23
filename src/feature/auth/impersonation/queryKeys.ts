import { USER_KEY } from "@/feature/user";

export const USER_IMPERSONATION_KEY = "impersonation";

export const userImpersonationQueryKeys = {
  all: [USER_KEY, USER_IMPERSONATION_KEY] as const,

  eligibleEmployees: (companyId?: string | null) =>
    [
      ...userImpersonationQueryKeys.all,
      "eligible-employees",
      companyId,
    ] as const,
};
