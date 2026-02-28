import { AccessLevel, Role } from "../auth/constants";
import { UserScope } from "../auth/types";

// user type for app.
export interface AppUser {
  id: string;
  username: string; // user account
  displayName: string; // user name
  email: string | null;
  image?: string;

  userScope: UserScope;
  tenantId: string | null;

  permission: AccessLevel;
  role: Role | null;

  canUseSuperUser: boolean | null; // from server.
  canUseImpersonation: boolean | null; // from server.
}
