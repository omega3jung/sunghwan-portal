import {
  GetUserPreferenceByKeyParams,
  SaveUserPreferenceByKeyInput,
  UserPreferenceDto,
} from "./userPreferenceDto";
import { toUserPreferenceDto } from "./userPreferenceMapper";
import {
  findUserPreferenceByKey,
  insertUserPreferenceByKey,
  patchUserPreferenceByKey,
} from "./userPreferenceRepository";

export async function getUserPreferenceByKey(
  params: GetUserPreferenceByKeyParams,
): Promise<UserPreferenceDto | null> {
  const row = await findUserPreferenceByKey(params);

  if (!row) {
    return null;
  }

  return toUserPreferenceDto(row);
}

export async function createUserPreferenceByKey(
  params: SaveUserPreferenceByKeyInput,
): Promise<UserPreferenceDto | null> {
  const row = await insertUserPreferenceByKey(params);

  if (!row) {
    return null;
  }

  return toUserPreferenceDto(row);
}

export async function updateUserPreferenceByKey(
  params: SaveUserPreferenceByKeyInput,
): Promise<UserPreferenceDto | null> {
  const row = await patchUserPreferenceByKey(params);

  if (!row) {
    return null;
  }

  return toUserPreferenceDto(row);
}
