import { allEmployeesMock } from "@/mocks/domain/organization/employee";
import {
  clientProfiles,
  demoAuths,
  demoProfiles,
  resolveDemoAuth,
} from "@/mocks/domain/user";
import { leftMenuJsonMock } from "@/mocks/ui/navigation/leftMenu";

const demoAuthUsernames = new Set(demoAuths.map((auth) => auth.username));

/** Returns impersonation target from LOCAL demo user resources. */
export function getLocalImpersonationTarget(username: string) {
  return resolveDemoAuth(username);
}

/** Returns active LOCAL employees backed by a demo portal login account. */
export function listLocalEligibleImpersonationEmployees(companyId: number) {
  return allEmployeesMock
    .filter(
      (employee) =>
        employee.e_active &&
        employee.e_company_id === companyId &&
        demoAuthUsernames.has(employee.e_username),
    )
    .map((employee) => ({
      username: employee.e_username,
      name: employee.e_name,
      email: employee.e_email,
      imageUrl: employee.e_image_url,
    }));
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
