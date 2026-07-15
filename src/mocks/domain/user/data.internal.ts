import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { displayNameMapper } from "@/lib/application/organization";

import {
  adminEmployee,
  guestEmployee,
  leaderEmployee,
  managerEmployee,
  userEmployee,
} from "../organization/employee/demoUser";
import { INTERNAL_DEMO_USER_IDS } from "./data.ids";
import { toAuth, toProfile } from "./mapper";
import { DemoAuthProfileSeed } from "./types";

export const adminData = {
  id: INTERNAL_DEMO_USER_IDS.ADMIN.ID,
  username: INTERNAL_DEMO_USER_IDS.ADMIN.USER_NAME,
  displayName: displayNameMapper(adminEmployee.e_name),
  email: adminEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.ADMIN.TOKEN,
  userScope: "INTERNAL",
  companyId: adminEmployee.e_company_id,
  permission: 9,
  role: "ADMIN",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const adminAuth = toAuth(adminData);
export const adminProfile = toProfile(adminData);

export const managerData = {
  id: INTERNAL_DEMO_USER_IDS.MANAGER.ID,
  username: INTERNAL_DEMO_USER_IDS.MANAGER.USER_NAME,
  displayName: displayNameMapper(managerEmployee.e_name),
  email: managerEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.MANAGER.TOKEN,
  userScope: "INTERNAL",
  companyId: managerEmployee.e_company_id,
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const managerAuth = toAuth(managerData);
export const managerProfile = toProfile(managerData);

export const leaderData = {
  id: INTERNAL_DEMO_USER_IDS.LEADER.ID,
  username: INTERNAL_DEMO_USER_IDS.LEADER.USER_NAME,
  displayName: displayNameMapper(leaderEmployee.e_name),
  email: leaderEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.MANAGER.TOKEN,
  userScope: "INTERNAL",
  companyId: leaderEmployee.e_company_id,
  permission: 5,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const leaderAuth = toAuth(leaderData);
export const leaderProfile = toProfile(leaderData);

export const userData = {
  id: INTERNAL_DEMO_USER_IDS.USER.ID,
  username: INTERNAL_DEMO_USER_IDS.USER.USER_NAME,
  displayName: displayNameMapper(userEmployee.e_name),
  email: userEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.USER.TOKEN,
  userScope: "INTERNAL",
  companyId: userEmployee.e_company_id,
  permission: 3,
  role: "USER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const userAuth = toAuth(userData);
export const userProfile = toProfile(userData);

export const guestData = {
  id: INTERNAL_DEMO_USER_IDS.GUEST.ID,
  username: INTERNAL_DEMO_USER_IDS.GUEST.USER_NAME,
  displayName: displayNameMapper(guestEmployee.e_name),
  email: guestEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.GUEST.TOKEN,
  userScope: "INTERNAL",
  companyId: guestEmployee.e_company_id,
  permission: 1,
  role: "GUEST",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const guestAuth = toAuth(guestData);
export const guestProfile = toProfile(guestData);

export const internalAuths: AuthUser[] = [
  adminAuth,
  managerAuth,
  leaderAuth,
  userAuth,
  guestAuth,
];

export const internalProfiles: AppUser[] = [
  adminProfile,
  managerProfile,
  leaderProfile,
  userProfile,
  guestProfile,
];
