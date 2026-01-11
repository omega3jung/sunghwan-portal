import { AppUser, AuthUser } from "@/types";

export function resolveTenantAuth(
  userName: string
): Omit<AuthUser, "dataScope"> | null {
  switch (userName) {
    case tenantAdminAuth.id:
      return tenantAdminAuth;
    case tenantManagerAuth.id:
      return tenantManagerAuth;
    case tenantUserAuth.id:
      return tenantUserAuth;
    case tenantGuestAuth.id:
      return tenantGuestAuth;
    default:
      return null;
  }
}

export function resolveTenantProfile(userId: string): AppUser | null {
  switch (userId) {
    case tenantAdminAuth.id:
      return tenantAdminProfile;
    case tenantManagerAuth.id:
      return tenantManagerProfile;
    case tenantUserAuth.id:
      return tenantUserProfile;
    case tenantGuestAuth.id:
      return tenantGuestProfile;
    default:
      return null;
  }
}

export const tenantAdminAuth: Omit<AuthUser, "dataScope"> = {
  id: "__demo_tenant_admin__",
  name: "Tenant Admin",
  email: "demoTenantAdmin@sunghwan-portal.dev",
  accessToken: "tenant-admin-token",
  userScope: "TENANT",
  tenantId: null,
  permission: 9,
  role: "ADMIN",
};

export const tenantAdminProfile: AppUser = {
  id: "__demo_admin__",
  name: "Tenant Admin",
  email: "demoTenantAdmin@sunghwan-portal.dev",
  userScope: "TENANT",
  tenantId: null,
  permission: 9,
  role: "ADMIN",
  preference: null,
  canUseSuperUser: null,
  canUseImpersonation: null,
};

export const tenantManagerAuth: Omit<AuthUser, "dataScope"> = {
  id: "__demo_manager__",
  name: "Tenant Manager",
  email: "demoTenantManager@sunghwan-portal.dev",
  accessToken: "tenant-manager-token",
  userScope: "TENANT",
  tenantId: null,
  permission: 7,
  role: "MANAGER",
};

export const tenantManagerProfile: AppUser = {
  id: "__demo_manager__",
  name: "Tenant Manager",
  email: "demoTenantManager@sunghwan-portal.dev",
  userScope: "TENANT",
  tenantId: null,
  permission: 7,
  role: "MANAGER",
  preference: null,
  canUseSuperUser: null,
  canUseImpersonation: null,
};

export const tenantUserAuth: Omit<AuthUser, "dataScope"> = {
  id: "__demo_user__",
  name: "Tenant User",
  email: "demoTenantUser@sunghwan-portal.dev",
  accessToken: "tenant-user-token",
  userScope: "TENANT",
  tenantId: null,
  permission: 3,
  role: "USER",
};

export const tenantUserProfile: AppUser = {
  id: "__demo_user__",
  name: "Tenant User",
  email: "demoTenantUser@sunghwan-portal.dev",
  userScope: "TENANT",
  tenantId: null,
  permission: 3,
  role: "USER",
  preference: null,
  canUseSuperUser: null,
  canUseImpersonation: null,
};

export const tenantGuestAuth: Omit<AuthUser, "dataScope"> = {
  id: "__demo_guest__",
  name: "Tenant Guest",
  email: "demoTenantGuest@sunghwan-portal.dev",
  accessToken: "tenant-guest-token",
  userScope: "TENANT",
  tenantId: null,
  permission: 1,
  role: "GUEST",
};

export const tenantGuestProfile: AppUser = {
  id: "__demo_guest__",
  name: "Tenant Guest",
  email: "demoTenantGuest@sunghwan-portal.dev",
  userScope: "TENANT",
  tenantId: null,
  permission: 1,
  role: "GUEST",
  preference: null,
  canUseSuperUser: null,
  canUseImpersonation: null,
};

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
