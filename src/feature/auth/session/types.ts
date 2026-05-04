import { SessionContextValue } from "next-auth/react";

import { CurrentSession } from "@/domain/auth";
import { SessionPatch } from "@/lib/authSessionStore";

export type UseCurrentSessionResult = Omit<SessionContextValue, "update"> & {
  current: CurrentSession;
  updateSession: (patch: SessionPatch, force?: boolean) => Promise<void>;
  hydrateSession: () => void;
  clearSession: () => void;
};
