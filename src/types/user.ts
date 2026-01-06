import { ColorTheme, Locale, ScreenMode } from "./config";

export type LoginCredentials = {
  username: string;
  password: string;
} & Record<string, string>;

export interface Preference {
  screenMode: ScreenMode;
  colorTheme: ColorTheme;
  language: Locale;
}

export const ACCESS_LEVEL = {
  ADMIN: 9,
  MANAGER: 7,
  USER: 3,
  GUEST: 1,
  // 8, 6, 5, 4, 2 reserved.
  // 0 = no permission.
} as const;

//export type AccessLevel = keyof typeof ACCESS_LEVEL;
export type Role = keyof typeof ACCESS_LEVEL;
export type AccessLevel = (typeof ACCESS_LEVEL)[Role];

// user type.
export interface AppUser {
  id: string;
  name: string;
  email?: string;
  image?: string;
  permission: AccessLevel; // permission represents user's access level (not feature permissions)
  role?: Role; // optional, derived or explicit
  preference?: Preference;
  accessToken?: string;
  canUseSuperUser?: boolean; // from server.
  canUseImpersonation?: boolean; // from server.
  userScope: "INTERNAL" | "TENANT"; // from server.
  tenantId?: string; // from server.
}

// Impersonation User type.
export type ActingUser = {
  actor: AppUser; // The actual logged-in user
  subject?: AppUser; // The impersonated user (optional)
};
