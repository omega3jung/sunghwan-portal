import {
  GetUserPreferenceByKeyParams,
  SaveUserPreferenceByKeyInput,
  UserPreferenceDto,
  UserProfileDto,
} from "./userDto";
import { toUserPreferenceDto, toUserProfileDto } from "./userMapper";
import {
  findUserPreferenceByKey,
  findUserProfileByUsername,
  insertUserPreferenceByKey,
  patchUserPreferenceByKey,
} from "./userRepository";

/** Loads user preference by key through the server data boundary. */
export async function getUserPreferenceByKey(
  params: GetUserPreferenceByKeyParams,
): Promise<UserPreferenceDto | null> {
  const row = await findUserPreferenceByKey(params);

  if (!row) {
    return null;
  }

  return toUserPreferenceDto(row);
}

/** Creates user preference by key through the server persistence boundary. */
export async function createUserPreferenceByKey(
  params: SaveUserPreferenceByKeyInput,
): Promise<UserPreferenceDto | null> {
  const row = await insertUserPreferenceByKey(params);

  if (!row) {
    return null;
  }

  return toUserPreferenceDto(row);
}

/** Updates user preference by key while preserving server-side validation and persistence rules. */
export async function updateUserPreferenceByKey(
  params: SaveUserPreferenceByKeyInput,
): Promise<UserPreferenceDto | null> {
  const row = await patchUserPreferenceByKey(params);

  if (!row) {
    return null;
  }

  return toUserPreferenceDto(row);
}

/** Loads user profile dto by username through the server data boundary. */
export async function getUserProfileDtoByUsername(
  username: string,
): Promise<UserProfileDto | null> {
  const row = await findUserProfileByUsername(username);

  if (!row) {
    return null;
  }

  return toUserProfileDto(row);
}
