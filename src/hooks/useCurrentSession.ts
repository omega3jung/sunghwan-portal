import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";

import { CurrentSession } from "@/domain/auth";
import { UseCurrentSessionResult } from "@/feature/auth";
import { useMyProfileQuery } from "@/feature/auth/hooks";
import { SessionPatch, useAuthSessionStore } from "@/lib/authSessionStore";
import { useImpersonationStore } from "@/lib/impersonationStore";

/**
 * Default security state used when no authenticated user is available.
 * Acts as a null-safe fallback for the session facade.
 */
const EMPTY_SECURITY: CurrentSession["security"] = {
  loginLockedUntil: null,
  failedAttempts: 0,
  requiresCaptcha: false,
};

/**
 * Builds the final session facade used by the UI.
 *
 * Purpose:
 * - Combines the NextAuth session, the fetched AppUser profile, and the
 *   Zustand runtime cache into a single UI-facing session object
 *
 * Composition:
 * - NextAuth authenticated session state
 * - React Query AppUser profile data
 * - Zustand runtime cache and session actions
 *
 * Layering:
 * - NextAuth remains the source of truth for authentication
 * - AppUser is fetched from the backend when needed
 * - Zustand acts as a cache and facade layer for the UI
 */
export const useCurrentSession = (): UseCurrentSessionResult => {
  /**
   * NextAuth session state.
   * Includes authentication status and minimal user information.
   */
  const session = useSession();

  /**
   * AppUser used by the UI.
   * - Loaded from the current session user id
   * - Resolves the effective user during impersonation
   */
  const { data: effectiveUserProfile } = useMyProfileQuery(session.data);

  /**
   * Zustand store slices.
   * Subscribe only to the values this hook actually needs to avoid
   * subscribing to the entire store.
   */
  const user = useAuthSessionStore((state) => state.user);
  const isSuperUser = useAuthSessionStore((state) => state.isSuperUser);
  const superUserActivated = useAuthSessionStore(
    (state) => state.superUserActivated,
  );
  const security = useAuthSessionStore((state) => state.security);

  /**
   * Zustand actions used by this hook.
   */
  const setSession = useAuthSessionStore((state) => state.setSession);
  const hydrateSession = useAuthSessionStore((state) => state.hydrateSession);
  const clearSession = useAuthSessionStore((state) => state.clearSession);

  /**
   * Impersonation reset action.
   */
  const resetImpersonation = useImpersonationStore((state) => state.reset);

  /**
   * Values derived directly from the NextAuth session.
   */
  const dataScope = session.data?.user?.dataScope;
  const expires = session.data?.expires ?? "";

  /**
   * Final session object consumed by the UI.
   *
   * Notes:
   * - Always null-safe
   * - Uses safe defaults when no user exists
   * - Keeps components from depending on raw session/store internals
   */
  const current = useMemo<CurrentSession>(() => {
    const isDemoUser = dataScope === "LOCAL";
    const isClient = user?.userScope === "CLIENT";

    return {
      user: user ?? null,
      expires,

      /**
       * Whether the current session uses local demo data.
       */
      isDemoUser,

      /**
       * Values that are only meaningful when a user exists.
       */
      isSuperUser: user ? isSuperUser : false,
      isClient: user ? isClient : false,
      superUserActivated: user ? superUserActivated : null,
      security: user ? security : EMPTY_SECURITY,
    };
  }, [dataScope, expires, isSuperUser, security, superUserActivated, user]);

  /**
   * Updates the local session facade and optionally refreshes NextAuth first.
   *
   * @param patch - Partial local store patch
   * @param force - When true, refresh the NextAuth session before patching locally
   *
   * Notes:
   * - `force` is not a full sync. It means "refresh session first, then patch locally"
   * - NextAuth remains the real source of truth
   */
  const updateSession = useCallback(
    async (patch: SessionPatch, force = false) => {
      if (force) {
        await session.update();
      }

      setSession(patch);
    },
    [session, setSession],
  );

  /**
   * 1. Initial hydration
   *
   * - Restores the persisted session snapshot from sessionStorage
   * - Helps the UI render quickly on the first client mount
   *
   * Note:
   * - This can later be overwritten by authenticated profile sync
   */
  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  /**
   * 2. Sync AppUser after authentication
   *
   * - Runs after authentication completes
   * - Writes the fetched profile into the local store
   *
   * Purpose:
   * - Lets the UI work from the richer AppUser model
   */
  useEffect(() => {
    if (session.status !== "authenticated") return;
    if (!effectiveUserProfile) return;

    setSession({ user: effectiveUserProfile });
  }, [effectiveUserProfile, session.status, setSession]);

  /**
   * 3. Reset client state after becoming unauthenticated
   *
   * - Handles logout or expired session cases
   * - Clears both impersonation state and the local session store
   */
  useEffect(() => {
    if (session.status !== "unauthenticated") return;

    resetImpersonation();
    clearSession();
  }, [clearSession, resetImpersonation, session.status]);

  /**
   * Final return value:
   * - NextAuth session result
   * - Current UI-facing session facade
   * - Session helper functions
   */
  return {
    ...session,
    current,
    updateSession,
    hydrateSession,
    clearSession,
  };
};
