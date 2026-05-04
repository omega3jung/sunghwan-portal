import { create } from "zustand";

import { CurrentSession } from "@/domain/auth";
import { AppUser } from "@/domain/user";

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
  hydrateSession: () => void;
  setSession: (patch: SessionPatch) => void;
  clearSession: () => void;
}

/*
 * Initial state
 * - Default is LOCAL (Try Demo access possible)
 */
const initialState: SessionState = {
  isDemoUser: false,
  isSuperUser: false,
  isClient: false,
  user: null,
  security: {
    loginLockedUntil: null,
    failedAttempts: 0,
    requiresCaptcha: false,
  },
  superUserActivated: null,
};

/**
 * Creates the client-side auth session store and persists its state in `sessionStorage`.
 *
 * Use for:
 * - Reading and updating authenticated user session data from React components
 * - Hydrating, patching, and clearing session state through a shared Zustand store
 *
 * @param none - This store hook does not accept any arguments
 * @returns A Zustand hook exposing auth session state together with session management actions
 */
export const useAuthSessionStore = create<SessionState & SessionActions>()(
  (set, get) => ({
    ...initialState,

    /**
     * Restores auth session state from `sessionStorage` into the in-memory store.
     *
     * Use for:
     * - Hydrating client session state after application startup
     * - Recovering previously persisted session values during browser navigation
     *
     * @param none - This action does not accept any arguments
     * @returns Nothing; the function updates the store with restored or fallback session state
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
     * Applies a partial auth session update and synchronizes the result to `sessionStorage`.
     *
     * Use for:
     * - Updating selected session fields without replacing the entire session object
     * - Persisting auth session changes after login, refresh, or profile updates
     *
     * @param patch - The partial session fields to merge into the current auth session state
     * @returns Nothing; the function writes the merged session state to storage and the store
     */
    setSession: (patch) => {
      const prev = get();

      let nextUser: AppUser | null;

      if (patch.user === undefined) {
        nextUser = prev.user;
      } else if (patch.user === null) {
        nextUser = null;
      } else {
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
     * Clears the persisted auth session and resets the in-memory store to its initial state.
     *
     * Use for:
     * - Removing auth session data during logout
     * - Resetting client session state after authentication becomes invalid
     *
     * @param none - This action does not accept any arguments
     * @returns Nothing; the function removes stored session data and restores default state
     */
    clearSession: () => {
      sessionStorage.removeItem(STORAGE_KEYS.SESSION);
      set(initialState);
    },
  }),
);

/**
 * Merges a partial user patch into the current user and ensures required user identity fields still exist.
 *
 * Use for:
 * - Safely updating nested user fields inside the auth session store
 * - Preventing invalid session state when patching a missing user object
 *
 * @param user - The current stored user, or `null` when no user is present yet
 * @param patch - The partial user fields to merge into the current user
 * @returns A complete `AppUser` object containing the merged user state
 */
function mergeAndAssertUser(
  user: AppUser | null,
  patch?: Partial<AppUser>,
): AppUser {
  const newUser = { ...user, ...patch };

  if (!newUser.id) {
    throw new Error(
      "[AuthSessionStore] Cannot patch user when prev.user is null",
    );
  }

  return newUser as AppUser;
}
