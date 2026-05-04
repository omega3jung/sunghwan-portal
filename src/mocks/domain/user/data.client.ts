import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";

import {
  clientAdminEmployee,
  clientGuestEmployee,
  clientLeaderEmployee,
  clientManagerEmployee,
  clientUserEmployee,
} from "../organization/employee/demoUser";
import { CLIENT_DEMO_USER_IDS } from "./data.ids";
import { displayNameMapper, toAuth, toProfile } from "./mapper";
import { DemoAuthProfileSeed } from "./types";

export const clientAdminData = {
  id: CLIENT_DEMO_USER_IDS.ADMIN.ID,
  employeeId: clientAdminEmployee.employee_id,
  username: clientAdminEmployee.employee_user_name,
  displayName: displayNameMapper(clientAdminEmployee.employee_name.en),
  email: clientAdminEmployee.employee_email,
  accessToken: CLIENT_DEMO_USER_IDS.ADMIN.TOKEN,
  userScope: "CLIENT",
  companyId: clientAdminEmployee.employee_company_id.toString(),
  permission: 9,
  role: "ADMIN",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientAdminAuth = toAuth(clientAdminData);
export const clientAdminProfile = toProfile(clientAdminData);

export const clientManagerData = {
  id: CLIENT_DEMO_USER_IDS.MANAGER.ID,
  employeeId: clientManagerEmployee.employee_id,
  username: clientManagerEmployee.employee_user_name,
  displayName: displayNameMapper(clientManagerEmployee.employee_name.en),
  email: clientManagerEmployee.employee_email,
  accessToken: CLIENT_DEMO_USER_IDS.MANAGER.TOKEN,
  userScope: "CLIENT",
  companyId: clientManagerEmployee.employee_company_id.toString(),
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientManagerAuth = toAuth(clientManagerData);
export const clientManagerProfile = toProfile(clientManagerData);

export const clientLeaderData = {
  id: CLIENT_DEMO_USER_IDS.LEADER.ID,
  employeeId: clientLeaderEmployee.employee_id,
  username: clientLeaderEmployee.employee_user_name,
  displayName: displayNameMapper(clientLeaderEmployee.employee_name.en),
  email: clientLeaderEmployee.employee_email,
  accessToken: CLIENT_DEMO_USER_IDS.LEADER.TOKEN,
  userScope: "CLIENT",
  companyId: clientLeaderEmployee.employee_company_id.toString(),
  permission: 7,
  role: "LEADER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientLeaderAuth = toAuth(clientLeaderData);
export const clientLeaderProfile = toProfile(clientLeaderData);

export const clientUserData = {
  id: CLIENT_DEMO_USER_IDS.USER.ID,
  employeeId: clientUserEmployee.employee_id,
  username: clientUserEmployee.employee_user_name,
  displayName: displayNameMapper(clientUserEmployee.employee_name.en),
  email: clientUserEmployee.employee_email,
  accessToken: CLIENT_DEMO_USER_IDS.USER.TOKEN,
  userScope: "CLIENT",
  companyId: clientUserEmployee.employee_company_id.toString(),
  permission: 3,
  role: "USER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientUserAuth = toAuth(clientUserData);
export const clientUserProfile = toProfile(clientUserData);

export const clientGuestData = {
  id: CLIENT_DEMO_USER_IDS.GUEST.ID,
  employeeId: clientGuestEmployee.employee_id,
  username: clientGuestEmployee.employee_user_name,
  displayName: displayNameMapper(clientGuestEmployee.employee_name.en),
  email: clientGuestEmployee.employee_email,
  accessToken: CLIENT_DEMO_USER_IDS.GUEST.TOKEN,
  userScope: "CLIENT",
  companyId: clientGuestEmployee.employee_company_id.toString(),
  permission: 1,
  role: "GUEST",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientGuestAuth = toAuth(clientGuestData);
export const clientGuestProfile = toProfile(clientGuestData);

export const clientAuths: Omit<AuthUser, "dataScope">[] = [
  clientAdminAuth,
  clientManagerAuth,
  clientLeaderAuth,
  clientUserAuth,
  clientGuestAuth,
];

export const clientProfiles: AppUser[] = [
  clientAdminProfile,
  clientManagerProfile,
  clientLeaderProfile,
  clientUserProfile,
  clientGuestProfile,
];
