import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

import { DEMO_USER_IDS } from "./data.ids";
import { toAuth, toProfile } from "./mapper";

export const clientAdminData = {
  id: DEMO_USER_IDS.CLIENT.ADMIN,
  username: "__demo_client_admin__",
  displayName: "Client Admin",
  email: "demoClientAdmin@sunghwan-portal.dev",
  accessToken: "demo-client-admin-token",
  userScope: "CLIENT",
  companyId: "11",
  permission: 9,
  role: "ADMIN",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const clientAdminAuth = toAuth(clientAdminData);
export const clientAdminProfile = toProfile(clientAdminData);

export const clientManagerData = {
  id: DEMO_USER_IDS.CLIENT.MANAGER,
  username: "__demo_client_manager__",
  displayName: "Client Manager",
  email: "demoClientManager@sunghwan-portal.dev",
  accessToken: "demo-client-manager-token",
  userScope: "CLIENT",
  companyId: "11",
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const clientManagerAuth = toAuth(clientManagerData);
export const clientManagerProfile = toProfile(clientManagerData);

export const clientUserData = {
  id: DEMO_USER_IDS.CLIENT.USER,
  username: "__demo_client_user__",
  displayName: "Client User",
  email: "demoClientUser@sunghwan-portal.dev",
  accessToken: "demo-client-user-token",
  userScope: "CLIENT",
  companyId: "11",
  permission: 3,
  role: "USER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const clientUserAuth = toAuth(clientUserData);
export const clientUserProfile = toProfile(clientUserData);

export const clientGuestData = {
  id: DEMO_USER_IDS.CLIENT.GUEST,
  username: "__demo_client_guest__",
  displayName: "Client Guest",
  email: "demoClientGuest@sunghwan-portal.dev",
  accessToken: "demo-client-guest-token",
  userScope: "CLIENT",
  companyId: "11",
  permission: 1,
  role: "GUEST",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const clientGuestAuth = toAuth(clientGuestData);
export const clientGuestProfile = toProfile(clientGuestData);

export const clientAuths: Omit<AuthUser, "dataScope">[] = [
  clientAdminAuth,
  clientManagerAuth,
  clientUserAuth,
  clientGuestAuth,
];

export const clientProfiles: AppUser[] = [
  clientAdminProfile,
  clientManagerProfile,
  clientUserProfile,
  clientGuestProfile,
];
