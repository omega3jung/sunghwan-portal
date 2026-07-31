import { SessionContextValue } from "next-auth/react";

import { CurrentSession } from "@/domain/auth";
import { SessionPatch } from "@/lib/client/auth";

/** Defines the use current session result returned to this feature boundary. */
export type UseCurrentSessionResult = Omit<SessionContextValue, "update"> & {
  current: CurrentSession;
  updateSession: (patch: SessionPatch, force?: boolean) => Promise<void>;
  hydrateSession: () => void;
  clearSession: () => void;
};
