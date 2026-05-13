import { LocalizedText } from "@/shared/types";

import { AppUser } from "../user/model";
import { AccessLevel, Role } from "./constants";
import { DataScope, UserScope } from "./types";

// user type for authorization.
// properties are required info only.
export interface AuthUser {
  id: string; // uuid
  employeeId: number | null; // employee domain id
  username: string; // user account
  displayName: LocalizedText; // user name
  email: string;
  accessToken: string;

  dataScope: DataScope; // 🔐 server-trusted
  userScope: UserScope; // 🔐 server-trusted
  companyId: string; // 🔐 server-trusted
  permission: AccessLevel; // permission represents user's access level (not feature permissions)
  role: Role; // 🔐 server-trusted
}

// UI-facing impersonation identities.
export type ImpersonationUsers = {
  originalUser: AppUser;
  impersonatedUser: AppUser | null;
  currentUser: AppUser;
};
