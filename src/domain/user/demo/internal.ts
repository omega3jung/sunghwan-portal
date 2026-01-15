import { AppUser, AuthUser } from "@/types";

import { DEMO_USER_IDS } from "./enum";
import { toAuth, toProfile } from "./util";

export function resolveDemoAuth(
  id: string
): Omit<AuthUser, "dataScope"> | null {
  return internalAuths.find((u) => u.id === id) ?? null;
}

export function resolveDemoProfile(id: string): AppUser | null {
  return internalProfiles.find((u) => u.id === id) ?? null;
}

export const adminData = {
  id: DEMO_USER_IDS.INTERNAL.ADMIN,
  username: "__demo_admin__",
  displayName: "Demo Admin",
  email: "demoAdmin@sunghwan-portal.dev",
  accessToken: "demo-admin-token",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 9,
  role: "ADMIN",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const adminAuth = toAuth(adminData);
export const adminProfile = toProfile(adminData);

export const managerData = {
  id: DEMO_USER_IDS.INTERNAL.MANAGER,
  username: "__demo_manager__",
  displayName: "Demo Manager",
  email: "demoManager@sunghwan-portal.dev",
  accessToken: "demo-manager-token",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const managerAuth = toAuth(managerData);
export const managerProfile = toProfile(managerData);

export const userData = {
  id: DEMO_USER_IDS.INTERNAL.USER,
  username: "__demo_user__",
  displayName: "Demo User",
  email: "demoUser@sunghwan-portal.dev",
  accessToken: "demo-user-token",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 3,
  role: "USER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const userAuth = toAuth(userData);
export const userProfile = toProfile(userData);

export const guestData = {
  id: DEMO_USER_IDS.INTERNAL.GUEST,
  username: "__demo_guest__",
  displayName: "Demo Guest",
  email: "demoGuest@sunghwan-portal.dev",
  accessToken: "demo-guest-token",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 1,
  role: "GUEST",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const guestAuth = toAuth(guestData);
export const guestProfile = toProfile(guestData);

export const internalAuths: Omit<AuthUser, "dataScope">[] = [
  adminAuth,
  managerAuth,
  userAuth,
  guestAuth,
];

export const internalProfiles: AppUser[] = [
  adminProfile,
  managerProfile,
  userProfile,
  guestProfile,
];
