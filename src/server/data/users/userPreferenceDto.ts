export interface UserPreferenceDto {
  preferenceKey: string;
  preferenceMeta: unknown;
}

export interface GetUserPreferenceByKeyParams {
  username: string;
  preferenceKey: string;
}

export interface SaveUserPreferenceByKeyInput {
  username: string;
  moduleKey: string;
  preferenceType: string;
  preferenceMeta: unknown;
}
