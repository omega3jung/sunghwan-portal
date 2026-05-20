// src/feature/user/preference/types.ts

import { Preference } from "@/domain/config";

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
