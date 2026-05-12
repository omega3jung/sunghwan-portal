import { UserProfileAuthContext, UserProfileDto } from "./userProfileDto";
import { toUserProfileDto } from "./userProfileMapper";
import { findUserProfileById } from "./userProfileRepository";

export async function getUserProfileDtoById(
  userId: string,
  authContext: UserProfileAuthContext,
): Promise<UserProfileDto | null> {
  const row = await findUserProfileById(userId);

  if (!row) {
    return null;
  }

  return toUserProfileDto(row, authContext);
}
