// src/feature/user/preference/queryKeys.ts

import { USER_KEY } from "../keys";

export const USER_PROFILE_KEY = "profile";

export const userProfileQueryKeys = {
  all: [USER_KEY, USER_PROFILE_KEY] as const,
  detail: (userId: string) =>
    [...userProfileQueryKeys.all, "detail", userId] as const,
};
