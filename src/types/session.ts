import { SessionState } from "@/lib/sessionStore";
import { AuthUser } from "./next-auth.d";
import { SessionContextValue } from "next-auth/react";

export type DataScope = "LOCAL" | "REMOTE";

export interface CurrentSession  {
  dataScope: DataScope; // LOCAL | REMOTE
  user: AuthUser;
  accessToken: string;
  expires: string;
  isSuperUser: boolean;
  superUserActivated?: Date; 
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
