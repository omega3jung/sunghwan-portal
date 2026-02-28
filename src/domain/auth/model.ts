import { AppUser } from "../user/model";
import { AccessLevel, Role } from "./constants";
import { DataScope, UserScope } from "./types";

// user type for authorization.
// properties are required info only.
export interface AuthUser {
  id: string; // uuid
  username: string; // user account
  displayName: string; // user name
  email: string;
  accessToken: string;

  dataScope: DataScope; // 🔐 server-trusted
  userScope: UserScope; // 🔐 server-trusted
  tenantId: string | null; // 🔐 server-trusted
  permission: AccessLevel; // permission represents user's access level (not feature permissions)
  role: Role; // 🔐 server-trusted
}

// Impersonation User type.
export type ActingUser = {
  actor: AppUser; // The actual logged-in user
  subject: AppUser | null; // The impersonated user (optional)
};
