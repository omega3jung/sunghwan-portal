import { create } from "zustand";

import { AppUser, CurrentSession } from "@/types";

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

export type SessionPatch = Omit<Partial<SessionState>, "user"> & {
  user?: Partial<AppUser> | null;
};

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
  setSession: (patch: SessionPatch) => void; // store + storage synchronization
  clearSession: () => void; // logout / clear session
}

/*
 * Initial state
 * - Default is LOCAL (Try Demo access possible)
 */
const initialState: SessionState = {
  isDemoUser: false,
  isSuperUser: false,
  user: null,
  security: {
    loginLockedUntil: null,
    failedAttempts: 0,
    requiresCaptcha: false,
  },
  superUserActivated: null,
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
    setSession: (patch) => {
      const prev = get();

      let nextUser: AppUser | null;

      if (patch.user === undefined) {
        nextUser = prev.user;
      } else if (patch.user === null) {
        nextUser = null;
      } else {
        // patch.user is Partial<AppUser>

        nextUser = mergeAndAssertUser(prev.user, patch.user);
      }

      const next: SessionState = {
        ...prev,
        ...patch,
        user: nextUser,
      };

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

function mergeAndAssertUser(
  user: AppUser | null,
  patch?: Partial<AppUser>
): AppUser {
  const newUser = { ...user, ...patch };

  // check required property.
  if (!newUser.id) {
    throw new Error("[SessionStore] Cannot patch user when prev.user is null");
  }

  return newUser as AppUser;
}
