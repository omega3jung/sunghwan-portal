// src/feature/user/profile/queryKeys.ts

import { USER_KEY, USER_PROFILE_KEY } from "../keys";

/** Builds stable TanStack Query keys for user profile cache entries. */
export const userProfileQueryKeys = {
  all: [USER_KEY, USER_PROFILE_KEY] as const,

  details: () => [...userProfileQueryKeys.all, "detail"] as const,
  detail: (userId: string | null) =>
    [...userProfileQueryKeys.details(), userId] as const,
};
