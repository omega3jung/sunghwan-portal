import { SessionContextValue } from "next-auth/react";

import { SessionState } from "@/lib/sessionStore";

import { AuthUser } from "./next-auth.d";

export type DataScope = "LOCAL" | "REMOTE";

export interface CurrentSession {
  dataScope: DataScope; // LOCAL | REMOTE
  user: AuthUser;
  expires: string;
  isSuperUser: boolean;
  superUserActivated?: Date;

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
