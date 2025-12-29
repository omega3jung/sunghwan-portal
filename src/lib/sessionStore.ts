import { create } from "zustand";

import { CurrentSession } from "@/types";

/*
 * =========================================================
 * Session Store (zustand)
 * ---------------------------------------------------------
 * Role:
 * - Single Source of Truth for Frontend "Domain Sessions"
 * - Manage LOCAL / REMOTE Sessions with the Same Structure
 * - Synchronize State with SessionStorage
 * =========================================================
 */

const STORAGE_KEYS = {
  SESSION: "sunghwan_portal_session",
} as const;

/*
 * Minimum state stored in the session
 * - dataScope: LOCAL | REMOTE
 * - user: User information
 * - accessToken: Token used for API calls
 * - isAdmin: Whether the user has admin privileges
 */
export type SessionState = Omit<CurrentSession, "expires">;

/*
 * Actions that manipulate session state
 *
 * Naming conventions:
 * - hydrateSession: Recovers storage from memory
 * - setSession: Updates the session (partial refresh)
 * - clearSession: Logs out / clears the session
 */
export interface SessionActions {
  hydrateSession: () => void; // sessionStorage → store
  setSession: (data: Partial<SessionState>) => void; // store + storage synchronization
  clearSession: () => void; // logout / clear session
}

/*
 * Initial state
 * - Default is LOCAL (Try Demo access possible)
 */
const initialState: SessionState = {
  dataScope: "LOCAL",
  isSuperUser: false,
  user: {
    id: undefined as never,
    name: undefined as never,
    email: undefined as never,
    accessToken: undefined as never,
  },
};

/*
 * Actual zustand store
 */
export const useSessionStore = create<SessionState & SessionActions>()(
  (set, get) => ({
    ...initialState,

    /**
     * Called when the app starts
     * Restores values ​​stored in sessionStorage to memory
     */
    hydrateSession: () => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        if (!raw) return;

        const parsed = JSON.parse(raw) as SessionState;
        set(parsed);
      } catch {
        set(initialState);
      }
    },

    /**
     * Update session information
     * - Synchronize memory status and sessionStorage
     */
    setSession: (data) => {
      const next = { ...get(), ...data };

      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(next));

      set(next);
    },

    /**
     * Called upon logout
     * - Clears all sessionStorage
     * - Resets memory state
     */
    clearSession: () => {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      set(initialState);
    },
  })
);
