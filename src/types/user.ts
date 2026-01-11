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
export type UserScope = "INTERNAL" | "TENANT";
export type DataScope = "LOCAL" | "REMOTE";

// user type for authorization.
// properties are required info only.
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  accessToken: string;

  dataScope: DataScope; // 🔐 server-trusted
  userScope: UserScope; // 🔐 server-trusted
  tenantId: string | null; // 🔐 server-trusted
  permission: AccessLevel; // permission represents user's access level (not feature permissions)
  role: Role; // 🔐 server-trusted
}

// user type for app.
export interface AppUser {
  id: string;
  name: string;
  email: string | null;
  image?: string;

  userScope: UserScope;
  tenantId: string | null;

  permission: AccessLevel;
  role: Role | null;

  preference: Preference | null;

  canUseSuperUser: boolean | null; // from server.
  canUseImpersonation: boolean | null; // from server.
}

// Impersonation User type.
export type ActingUser = {
  actor: AppUser; // The actual logged-in user
  subject: AppUser | null; // The impersonated user (optional)
};
