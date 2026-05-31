import { UserProfileAuthContext, UserProfileDto } from "./userProfileDto";
import { toUserProfileDto } from "./userProfileMapper";
import { findUserProfileByUsername } from "./userProfileRepository";

export async function getUserProfileDtoByUsername(
  username: string,
  authContext: UserProfileAuthContext,
): Promise<UserProfileDto | null> {
  const row = await findUserProfileByUsername(username);

  if (!row) {
    return null;
  }

  return toUserProfileDto(row, authContext);
}
