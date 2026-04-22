import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

import {
  adminEmployee,
  guestEmployee,
  leaderEmployee,
  managerEmployee,
  userEmployee,
} from "../organization/employee/demoUser";
import { INTERNAL_DEMO_USER_IDS } from "./data.ids";
import { displayNameMapper, toAuth, toProfile } from "./mapper";
import { DemoAuthProfileSeed } from "./types";

export const adminData = {
  id: INTERNAL_DEMO_USER_IDS.ADMIN.ID,
  employeeId: adminEmployee.employee_id,
  username: adminEmployee.employee_user_name,
  displayName: displayNameMapper(adminEmployee.employee_name.en),
  email: adminEmployee.employee_email,
  accessToken: INTERNAL_DEMO_USER_IDS.ADMIN.TOKEN,
  userScope: "INTERNAL",
  companyId: adminEmployee.employee_company_id.toString(),
  permission: 9,
  role: "ADMIN",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const adminAuth = toAuth(adminData);
export const adminProfile = toProfile(adminData);

export const managerData = {
  id: INTERNAL_DEMO_USER_IDS.MANAGER.ID,
  employeeId: managerEmployee.employee_id,
  username: managerEmployee.employee_user_name,
  displayName: displayNameMapper(managerEmployee.employee_name.en),
  email: managerEmployee.employee_email,
  accessToken: INTERNAL_DEMO_USER_IDS.MANAGER.TOKEN,
  userScope: "INTERNAL",
  companyId: managerEmployee.employee_company_id.toString(),
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const managerAuth = toAuth(managerData);
export const managerProfile = toProfile(managerData);

export const leaderData = {
  id: INTERNAL_DEMO_USER_IDS.LEADER.ID,
  employeeId: leaderEmployee.employee_id,
  username: leaderEmployee.employee_user_name,
  displayName: displayNameMapper(leaderEmployee.employee_name.en),
  email: leaderEmployee.employee_email,
  accessToken: INTERNAL_DEMO_USER_IDS.MANAGER.TOKEN,
  userScope: "INTERNAL",
  companyId: leaderEmployee.employee_company_id.toString(),
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const leaderAuth = toAuth(leaderData);
export const leaderProfile = toProfile(leaderData);

export const userData = {
  id: INTERNAL_DEMO_USER_IDS.USER.ID,
  employeeId: userEmployee.employee_id,
  username: userEmployee.employee_user_name,
  displayName: displayNameMapper(userEmployee.employee_name.en),
  email: userEmployee.employee_email,
  accessToken: INTERNAL_DEMO_USER_IDS.USER.TOKEN,
  userScope: "INTERNAL",
  companyId: userEmployee.employee_company_id.toString(),
  permission: 3,
  role: "USER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const userAuth = toAuth(userData);
export const userProfile = toProfile(userData);

export const guestData = {
  id: INTERNAL_DEMO_USER_IDS.GUEST.ID,
  employeeId: guestEmployee.employee_id,
  username: guestEmployee.employee_user_name,
  displayName: displayNameMapper(guestEmployee.employee_name.en),
  email: guestEmployee.employee_email,
  accessToken: INTERNAL_DEMO_USER_IDS.GUEST.TOKEN,
  userScope: "INTERNAL",
  companyId: guestEmployee.employee_company_id.toString(),
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
