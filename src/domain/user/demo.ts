import { AppUser, AuthUser } from "@/types";

export function resolveDemoAuth(
  userId: string
): Omit<AuthUser, "dataScope"> | null {
  switch (userId) {
    case adminAuth.id:
      return adminAuth;
    case managerAuth.id:
      return managerAuth;
    case userAuth.id:
      return userAuth;
    case guestAuth.id:
      return guestAuth;
    default:
      return null;
  }
}

export function resolveDemoProfile(userId: string): AppUser | null {
  switch (userId) {
    case adminAuth.id:
      return adminProfile;
    case managerAuth.id:
      return managerProfile;
    case userAuth.id:
      return userProfile;
    case guestAuth.id:
      return guestProfile;
    default:
      return null;
  }
}

export const adminAuth: Omit<AuthUser, "dataScope"> = {
  id: "__demo_admin__",
  name: "Demo Admin",
  email: "demoAdmin@sunghwan-portal.dev",
  accessToken: "demo-admin-token",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 9,
  role: "ADMIN",
};

export const adminProfile: AppUser = {
  id: "__demo_admin__",
  name: "Demo Admin",
  email: "demoAdmin@sunghwan-portal.dev",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 9,
  role: "ADMIN",
  preference: null,
  canUseSuperUser: null,
  canUseImpersonation: null,
};

export const managerAuth: Omit<AuthUser, "dataScope"> = {
  id: "__demo_manager__",
  name: "Demo Manager",
  email: "demoManager@sunghwan-portal.dev",
  accessToken: "demo-manager-token",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 7,
  role: "MANAGER",
};

export const managerProfile: AppUser = {
  id: "__demo_manager__",
  name: "Demo Manager",
  email: "demoManager@sunghwan-portal.dev",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 7,
  role: "MANAGER",
  preference: null,
  canUseSuperUser: null,
  canUseImpersonation: null,
};

export const userAuth: Omit<AuthUser, "dataScope"> = {
  id: "__demo_user__",
  name: "Demo User",
  email: "demoUser@sunghwan-portal.dev",
  accessToken: "demo-user-token",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 3,
  role: "USER",
};

export const userProfile: AppUser = {
  id: "__demo_user__",
  name: "Demo User",
  email: "demoUser@sunghwan-portal.dev",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 3,
  role: "USER",
  preference: null,
  canUseSuperUser: null,
  canUseImpersonation: null,
};

export const guestAuth: Omit<AuthUser, "dataScope"> = {
  id: "__demo_guest__",
  name: "Demo Guest",
  email: "demoGuest@sunghwan-portal.dev",
  accessToken: "demo-guest-token",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 1,
  role: "GUEST",
};

export const guestProfile: AppUser = {
  id: "__demo_guest__",
  name: "Demo Guest",
  email: "demoGuest@sunghwan-portal.dev",
  userScope: "INTERNAL",
  tenantId: null,
  permission: 1,
  role: "GUEST",
  preference: null,
  canUseSuperUser: null,
  canUseImpersonation: null,
};

export const demoAuths: Omit<AuthUser, "dataScope">[] = [
  adminAuth,
  managerAuth,
  userAuth,
  guestAuth,
];

export const demoProfiles: AppUser[] = [
  adminProfile,
  managerProfile,
  userProfile,
  guestProfile,
];
