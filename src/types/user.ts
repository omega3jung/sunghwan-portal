import { ColorTheme, ScreenMode } from "./config";

export type LoginCredentials = {
  username: string;
  password: string;
} & Record<string, string>;

export interface Preference {
  screenMode: ScreenMode;
  colorTheme: ColorTheme;
  language: string;
}

export const ACCESS_LEVEL = {
  ADMIN: 9,
  MANAGER: 7,
  USER: 3,
  GUEST: 1,
  // 8, 6, 5, 4, 2 reserved.
  // 0 = no permission.
} as const;

export type AccessLevel = keyof typeof ACCESS_LEVEL;

// user type.
export interface AppUser {
  id: string;
  name: string;
  email?: string;
  image?: string;
  permission: AccessLevel; // permission represents user's access level (not feature permissions)
  preference?: Preference;
  accessToken?: string;
  canUseSuperUser?: boolean; // from server.
  canUseImpersonation?: boolean; // from server.
}

// Impersonation User type.
export type ActingUser = {
  actor: AppUser;      // 실제 로그인한 사용자
  subject?: AppUser;   // 대리 사용자 (optional)
};