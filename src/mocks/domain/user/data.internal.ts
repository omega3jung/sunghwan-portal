import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { displayNameMapper } from "@/shared/utils/i18n/displayName";

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
  employeeId: adminEmployee.e_id,
  username: adminEmployee.e_user_name,
  displayName: displayNameMapper(adminEmployee.e_name),
  email: adminEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.ADMIN.TOKEN,
  userScope: "INTERNAL",
  companyId: adminEmployee.e_cid.toString(),
  permission: 9,
  role: "ADMIN",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const adminAuth = toAuth(adminData);
export const adminProfile = toProfile(adminData);

export const managerData = {
  id: INTERNAL_DEMO_USER_IDS.MANAGER.ID,
  employeeId: managerEmployee.e_id,
  username: managerEmployee.e_user_name,
  displayName: displayNameMapper(managerEmployee.e_name),
  email: managerEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.MANAGER.TOKEN,
  userScope: "INTERNAL",
  companyId: managerEmployee.e_cid.toString(),
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const managerAuth = toAuth(managerData);
export const managerProfile = toProfile(managerData);

export const leaderData = {
  id: INTERNAL_DEMO_USER_IDS.LEADER.ID,
  employeeId: leaderEmployee.e_id,
  username: leaderEmployee.e_user_name,
  displayName: displayNameMapper(leaderEmployee.e_name),
  email: leaderEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.MANAGER.TOKEN,
  userScope: "INTERNAL",
  companyId: leaderEmployee.e_cid.toString(),
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const leaderAuth = toAuth(leaderData);
export const leaderProfile = toProfile(leaderData);

export const userData = {
  id: INTERNAL_DEMO_USER_IDS.USER.ID,
  employeeId: userEmployee.e_id,
  username: userEmployee.e_user_name,
  displayName: displayNameMapper(userEmployee.e_name),
  email: userEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.USER.TOKEN,
  userScope: "INTERNAL",
  companyId: userEmployee.e_cid.toString(),
  permission: 3,
  role: "USER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const userAuth = toAuth(userData);
export const userProfile = toProfile(userData);

export const guestData = {
  id: INTERNAL_DEMO_USER_IDS.GUEST.ID,
  employeeId: guestEmployee.e_id,
  username: guestEmployee.e_user_name,
  displayName: displayNameMapper(guestEmployee.e_name),
  email: guestEmployee.e_email,
  accessToken: INTERNAL_DEMO_USER_IDS.GUEST.TOKEN,
  userScope: "INTERNAL",
  companyId: guestEmployee.e_cid.toString(),
  permission: 1,
  role: "GUEST",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const guestAuth = toAuth(guestData);
export const guestProfile = toProfile(guestData);

export const internalAuths: Omit<AuthUser, "dataScope">[] = [
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
