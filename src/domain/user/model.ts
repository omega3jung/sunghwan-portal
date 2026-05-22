import { LocalizedText } from "@/shared/types";

import { AccessLevel } from "../auth/constants";
import { UserScope } from "../auth/types";

// user type for app.
export interface AppUser {
  id: string;
  username: string; // user account
  displayName: LocalizedText; // user name
  email: string | null;
  image?: string;

  userScope: UserScope;
  companyId: number;

  permission: AccessLevel;

  canUseSuperUser: boolean | null; // from server.
  canUseImpersonation: boolean | null; // from server.
}
