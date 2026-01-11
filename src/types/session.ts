import { SessionContextValue } from "next-auth/react";

import { SessionState } from "@/lib/sessionStore";

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
  updateSession: (
    data: Partial<SessionState>,
    force?: boolean
  ) => Promise<void>;
  hydrateSession: () => void;
  clearSession: () => void;
};
