import {
  clientProfiles,
  demoProfiles,
  resolveDemoAuth,
} from "@/mocks/domain/user";
import { leftMenuJsonMock } from "@/mocks/ui/navigation/leftMenu";

/** Returns impersonation target from LOCAL demo user resources. */
export function getLocalImpersonationTarget(username: string) {
  return resolveDemoAuth(username);
}

/** Returns left menu from LOCAL demo user resources. */
export function getLocalLeftMenu(username: string) {
  const auth = resolveDemoAuth(username);
  if (!auth) return null;

  return leftMenuJsonMock.filter(
    (item) => item.minAccessLevel <= auth.permission,
  );
}

/** Returns user profile from LOCAL demo user resources. */
export function getLocalUserProfile(userKey: string) {
  const normalizedUserKey = userKey.trim();

  return (
    [...demoProfiles, ...clientProfiles].find(
      (profile) =>
        profile.id === normalizedUserKey ||
        profile.username === normalizedUserKey,
    ) ?? null
  );
}
