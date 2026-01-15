import { SessionContextValue } from "next-auth/react";

import { PreferencePatch } from "@/lib/preferenceStore";
import { SessionPatch } from "@/lib/sessionStore";

import { ColorTheme, Locale, Preference, ScreenMode } from "./config";
import { AppUser } from "./user";

export interface CurrentSession {
  user: AppUser | null;
  expires: string;
  isDemoUser: boolean;
  isSuperUser: boolean;
  superUserActivated: Date | null;

  // Security-related information for public sessions.
  security: {
    loginLockedUntil: number | null;
    failedAttempts: number;
    requiresCaptcha: boolean;
  };
}

export type UseCurrentSessionResult = Omit<SessionContextValue, "update"> & {
  current: CurrentSession;
  updateSession: (patch: SessionPatch, force?: boolean) => Promise<void>;
  hydrateSession: () => void;
  clearSession: () => void;
};

export type UseCurrentPreferenceResult = {
  status: "loading" | "ready";
  current: Preference;

  setLanguage: (language: Locale) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setScreenMode: (mode: ScreenMode) => void;

  updatePreference: (patch: PreferencePatch, force?: boolean) => Promise<void>;
  hydratePreference: () => void;
  clearPreference: () => void;
};
