import type { AccessLevel, Role, UserScope } from "@/domain/auth";
import { LocalizedName } from "@/domain/organization";

/** Defines the PostgreSQL user preference row used only within the repository boundary. */
export interface UserPreferenceRow {
  ump_preference_key: string;
  ump_preference_meta: unknown;
}

/** Defines the PostgreSQL user profile row used only within the repository boundary. */
export type UserProfileRow = {
  aa_id: string;
  aa_username: string;
  aa_role: Role;
  aa_access_level: AccessLevel;
  aa_user_scope: UserScope;
  e_username: string;
  e_name: LocalizedName;
  e_email: string | null;
  e_company_id: number;
};
