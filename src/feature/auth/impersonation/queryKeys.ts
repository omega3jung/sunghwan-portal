// src/feature/auth/impersonation/queryKeys.ts

import { USER_KEY } from "@/feature/user";

/** Builds stable TanStack Query keys for user impersonation key cache entries. */
export const USER_IMPERSONATION_KEY = "impersonation";

/** Builds stable TanStack Query keys for user impersonation cache entries. */
export const userImpersonationQueryKeys = {
  all: [USER_KEY, USER_IMPERSONATION_KEY] as const,
};
