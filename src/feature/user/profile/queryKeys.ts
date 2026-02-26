// src/feature/user/profile/queryKeys.ts

import { USER_KEY, USER_PROFILE_KEY } from "../keys";

export const userProfileQueryKeys = {
  all: [USER_KEY, USER_PROFILE_KEY] as const,
  detail: (userId: string) =>
    [...userProfileQueryKeys.all, "detail", userId] as const,
};
