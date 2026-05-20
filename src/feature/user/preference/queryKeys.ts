// src/feature/user/preference/queryKeys.ts

import { USER_KEY, USER_PREFERENCE_KEY } from "../keys";
import { GetPreferenceInput } from "./types";

export const userPreferenceQueryKeys = {
  all: [USER_KEY, USER_PREFERENCE_KEY] as const,

  details: () => [...userPreferenceQueryKeys.all, "detail"] as const,
  detail: (params: GetPreferenceInput) =>
    [...userPreferenceQueryKeys.details(), params] as const,
};
