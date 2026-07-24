import {
  clientProfiles,
  demoProfiles,
  resolveDemoAuth,
} from "@/mocks/domain/user";
import { leftMenuJsonMock } from "@/mocks/ui/navigation/leftMenu";

export function getLocalImpersonationTarget(username: string) {
  return resolveDemoAuth(username);
}

export function getLocalLeftMenu(username: string) {
  const auth = resolveDemoAuth(username);
  if (!auth) return null;

  return leftMenuJsonMock.filter(
    (item) => item.minAccessLevel <= auth.permission,
  );
}

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
