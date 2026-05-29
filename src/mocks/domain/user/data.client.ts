import { AuthUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { displayNameMapper } from "@/shared/utils/i18n/displayName";

import {
  clientAdminEmployee,
  clientGuestEmployee,
  clientLeaderEmployee,
  clientManagerEmployee,
  clientUserEmployee,
} from "../organization/employee/demoUser";
import { CLIENT_DEMO_USER_IDS } from "./data.ids";
import { toAuth, toProfile } from "./mapper";
import { DemoAuthProfileSeed } from "./types";

export const clientAdminData = {
  id: CLIENT_DEMO_USER_IDS.ADMIN.ID,
  username: CLIENT_DEMO_USER_IDS.ADMIN.USER_NAME,
  displayName: displayNameMapper(clientAdminEmployee.e_name),
  email: clientAdminEmployee.e_email,
  accessToken: CLIENT_DEMO_USER_IDS.ADMIN.TOKEN,
  userScope: "CLIENT",
  companyId: clientAdminEmployee.e_company_id,
  permission: 9,
  role: "ADMIN",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientAdminAuth = toAuth(clientAdminData);
export const clientAdminProfile = toProfile(clientAdminData);

export const clientManagerData = {
  id: CLIENT_DEMO_USER_IDS.MANAGER.ID,
  username: CLIENT_DEMO_USER_IDS.MANAGER.USER_NAME,
  displayName: displayNameMapper(clientManagerEmployee.e_name),
  email: clientManagerEmployee.e_email,
  accessToken: CLIENT_DEMO_USER_IDS.MANAGER.TOKEN,
  userScope: "CLIENT",
  companyId: clientManagerEmployee.e_company_id,
  permission: 7,
  role: "MANAGER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientManagerAuth = toAuth(clientManagerData);
export const clientManagerProfile = toProfile(clientManagerData);

export const clientLeaderData = {
  id: CLIENT_DEMO_USER_IDS.LEADER.ID,
  username: CLIENT_DEMO_USER_IDS.LEADER.USER_NAME,
  displayName: displayNameMapper(clientLeaderEmployee.e_name),
  email: clientLeaderEmployee.e_email,
  accessToken: CLIENT_DEMO_USER_IDS.LEADER.TOKEN,
  userScope: "CLIENT",
  companyId: clientLeaderEmployee.e_company_id,
  permission: 5,
  role: "LEADER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientLeaderAuth = toAuth(clientLeaderData);
export const clientLeaderProfile = toProfile(clientLeaderData);

export const clientUserData = {
  id: CLIENT_DEMO_USER_IDS.USER.ID,
  username: CLIENT_DEMO_USER_IDS.USER.USER_NAME,
  displayName: displayNameMapper(clientUserEmployee.e_name),
  email: clientUserEmployee.e_email,
  accessToken: CLIENT_DEMO_USER_IDS.USER.TOKEN,
  userScope: "CLIENT",
  companyId: clientUserEmployee.e_company_id,
  permission: 3,
  role: "USER",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientUserAuth = toAuth(clientUserData);
export const clientUserProfile = toProfile(clientUserData);

export const clientGuestData = {
  id: CLIENT_DEMO_USER_IDS.GUEST.ID,
  username: CLIENT_DEMO_USER_IDS.GUEST.USER_NAME,
  displayName: displayNameMapper(clientGuestEmployee.e_name),
  email: clientGuestEmployee.e_email,
  accessToken: CLIENT_DEMO_USER_IDS.GUEST.TOKEN,
  userScope: "CLIENT",
  companyId: clientGuestEmployee.e_company_id,
  permission: 1,
  role: "GUEST",
  canUseSuperUser: null,
  canUseImpersonation: null,
} satisfies DemoAuthProfileSeed;

export const clientGuestAuth = toAuth(clientGuestData);
export const clientGuestProfile = toProfile(clientGuestData);

export const clientAuths: AuthUser[] = [
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
