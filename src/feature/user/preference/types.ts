// src/feature/user/preference/types.ts

import { Preference } from "@/domain/user/preference";

export interface GetPreferenceInput {
  userId?: string | null;
  isRemote: boolean;
  preferenceKey: string;
}

export interface SavePreferenceInput<T> {
  userId?: string | null;
  isRemote: boolean;
  data: Preference<T>;
}
