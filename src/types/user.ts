import { ColorTheme, ScreenMode } from "./config";

export type LoginCredentials = {
  username: string;
  password: string;
} & Record<string, string>;

export interface UserSettings {
  screenMode: ScreenMode;
  colorTheme: ColorTheme;
  language: string;
}

export type DataScope = "LOCAL" | "REMOTE";

export const ROLE_PRIORITY = {
  MANAGER: 9,
  LEADER: 7,
  EMPLOYEE: 3,
  VISITOR: 1,
  // 8, 6, 5, 4, 2 are for later.
  // 0 is no permission.
} as const;

export type Role = keyof typeof ROLE_PRIORITY;

export type Permission = {
  scope: DataScope;
  role: Role;
};

// User info from API.
export interface UserSession {
  id: number;
  name: string;
  email: string;
  settings: UserSettings;
  permission: Permission; // required permission info.
  isSuperUser?: boolean;
}

// Session user type for front end.
export type CurrentSessionUser = UserSession;
