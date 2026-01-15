import { AppUser, AuthUser } from "@/types";

import { DEMO_USER_IDS } from "./enum";
import { toAuth, toProfile } from "./util";

export function resolveTenantAuth(
  id: string
): Omit<AuthUser, "dataScope"> | null {
  return tenantAuths.find((u) => u.id === id) ?? null;
}

export function resolveTenantProfile(id: string): AppUser | null {
  return tenantProfiles.find((u) => u.id === id) ?? null;
}

export const tenantAdminData = {
  id: DEMO_USER_IDS.TENANT.ADMIN,
  username: "__demo_tenant_admin__",
  displayName: "Tenant Admin",
  email: "demoTenantAdmin@sunghwan-portal.dev",
  accessToken: "demo-tenant-admin-token",
  userScope: "TENANT",
  tenantId: null,
  permission: 9,
  role: "ADMIN",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const tenantAdminAuth = toAuth(tenantAdminData);
export const tenantAdminProfile = toProfile(tenantAdminData);

export const tenantManagerData = {
  id: DEMO_USER_IDS.TENANT.MANAGER,
  username: "__demo_tenant_manager__",
  displayName: "Tenant Manager",
  email: "demoTenantManager@sunghwan-portal.dev",
  accessToken: "demo-tenant-manager-token",
  userScope: "TENANT",
  tenantId: null,
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const tenantManagerAuth = toAuth(tenantManagerData);
export const tenantManagerProfile = toProfile(tenantManagerData);

export const tenantUserData = {
  id: DEMO_USER_IDS.TENANT.USER,
  username: "__demo_tenant_user__",
  displayName: "Tenant User",
  email: "demoTenantUser@sunghwan-portal.dev",
  accessToken: "demo-tenant-user-token",
  userScope: "TENANT",
  tenantId: null,
  permission: 3,
  role: "USER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const tenantUserAuth = toAuth(tenantUserData);
export const tenantUserProfile = toProfile(tenantUserData);

export const tenantGuestData = {
  id: DEMO_USER_IDS.TENANT.GUEST,
  username: "__demo_tenant_guest__",
  displayName: "Tenant Guest",
  email: "demoTenantGuest@sunghwan-portal.dev",
  accessToken: "demo-tenant-guest-token",
  userScope: "TENANT",
  tenantId: null,
  permission: 1,
  role: "GUEST",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies AppUser & { accessToken: string };

export const tenantGuestAuth = toAuth(tenantGuestData);
export const tenantGuestProfile = toProfile(tenantGuestData);

export const tenantAuths: Omit<AuthUser, "dataScope">[] = [
  tenantAdminAuth,
  tenantManagerAuth,
  tenantUserAuth,
  tenantGuestAuth,
];

export const tenantProfiles: AppUser[] = [
  tenantAdminProfile,
  tenantManagerProfile,
  tenantUserProfile,
  tenantGuestProfile,
];
