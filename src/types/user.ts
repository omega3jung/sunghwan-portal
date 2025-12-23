import { ColorTheme, ScreenMode } from "./config";
import { DataScope } from "./session";

export type LoginCredentials = {
  username: string;
  password: string;
} & Record<string, string>;

export interface Preference {
  screenMode: ScreenMode;
  colorTheme: ColorTheme;
  language: string;
}

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

// user type.
export interface AppUser {
  id: string;
  name: string;
  email: string;
  permission: Permission; // required permission info.
  preference?: Preference;
  accessToken?: string;
}
