import { UserPreferenceDto } from "./userPreferenceDto";
import { UserPreferenceRow } from "./userPreferenceRow";

export function toUserPreferenceDto(row: UserPreferenceRow): UserPreferenceDto {
  return {
    preferenceKey: row.ump_preference_key,
    preferenceMeta: row.ump_preference_meta,
  };
}
