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

export type UserRole = string;

// API에서 받아오는 사용자 정보
export interface UserSession {
  id: number;
  name: string;
  email: string;
  settings: UserSettings;
  roles: UserRole[]; // ← 필수 권한 정보
}

// FE에서 사용하는 세션 사용자 타입
export type CurrentSessionUser = UserSession;
