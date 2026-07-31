// src/feature/user/preference/types.ts

import { Preference } from "@/domain/user/preference";

/** Defines the get preference input accepted at this feature boundary. */
export interface GetPreferenceInput {
  userId?: string | null;
  isRemote: boolean;
  preferenceKey: string;
}

/** Defines the save preference input accepted at this feature boundary. */
export interface SavePreferenceInput<T> {
  userId?: string | null;
  isRemote: boolean;
  data: Preference<T>;
}
