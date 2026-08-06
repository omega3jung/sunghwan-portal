import { LocalizedText } from "@/shared/types";

import { AppUser } from "../user/model";
import { AccessLevel, Role } from "./constants";
import { DataScope, UserScope } from "./types";

/** Minimal authenticated identity shared by authorization and session boundaries. */
export interface AuthUser {
  id: string; // UUID
  username: string;
  displayName: LocalizedText;
  email: string;
  accessToken: string;

  /** Authentication claims supplied by the server, not client preference state. */
  dataScope: DataScope;
  userScope: UserScope;
  companyId: number;
  permission: AccessLevel; // Global access level, not feature-specific permissions.
  role: Role;
}

/** Original, impersonated, and effective identities exposed to the client UI. */
export type ImpersonationUsers = {
  originalUser: AppUser;
  impersonatedUser: AppUser | null;
  currentUser: AppUser;
};
