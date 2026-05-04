// src/feature/user/preference/queryKeys.ts

import { USER_KEY, USER_PREFERENCE_KEY } from "../keys";

export const userPreferenceQueryKeys = {
  all: [USER_KEY, USER_PREFERENCE_KEY] as const,

  details: () => [...userPreferenceQueryKeys.all, "detail"] as const,
  detail: (userId: string | null) =>
    [...userPreferenceQueryKeys.details(), userId] as const,
};
