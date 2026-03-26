import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";

import { CurrentSession } from "@/domain/auth";
import { UseCurrentSessionResult } from "@/feature/auth";
import { useMyProfileQuery } from "@/feature/auth/hooks";
import { SessionPatch, useAuthSessionStore } from "@/lib/authSessionStore";
import { useImpersonationStore } from "@/lib/impersonationStore";

/**
 * Combines the NextAuth session and the auth session store into a single session facade for the UI.
 *
 * Use for:
 * - Reading authenticated user state without coupling components to multiple stores
 * - Updating or clearing session data through a single frontend access point
 *
 * @param none - This hook does not accept any arguments
 * @returns A session facade containing the current session snapshot, NextAuth state, and session update helpers
 */
export const useCurrentSession = (): UseCurrentSessionResult => {
  /*
   * next-auth session.
   * - authorization status (loading, authenticated / unauthenticated)
   * - expires
   */
  const session = useSession();

  /*
   * zustand auth session store.
   * - dataScope
   * - isSuperUser
   * - user: { id, name, email, dataScope }
   * - accessToken
   */
  const store = useAuthSessionStore();

  /*
   * zustand impersonation user store.
   * - actor
   * - subject
   */
  const impersonation = useImpersonationStore();

  /*
   * The ID that last called meApi or userProfileApi
   */
  const { data: effectiveUserProfile } = useMyProfileQuery(session.data);

  /*
   * From here on, authenticated is guaranteed at the type level.
   *
   * Processing session data for direct use in the UI.
   *
   * Principles:
   * - Eliminate calculation logic from page/component.
   * - Only update this hook when the session data structure changes.
   */
  const current = useMemo<CurrentSession>(() => {
    const { user, isSuperUser, superUserActivated, security } = store;
    const isDemoUser = session.data?.user?.dataScope === "LOCAL";

    if (!user) {
      return {
        user: null,
        expires: "",
        isDemoUser,
        isSuperUser: false,
        superUserActivated: null,
        security: {
          loginLockedUntil: null,
          failedAttempts: 0,
          requiresCaptcha: false,
        },
      };
    }

    return {
      user: user,
      expires: "",
      isDemoUser,
      isSuperUser: isSuperUser,
      superUserActivated: superUserActivated,
      security: security,
    };
  }, [
    store.user,
    store.isSuperUser,
    store.superUserActivated,
    store.security,
    session.data?.user?.dataScope,
  ]);

  /**
   * Updates the auth session store and optionally refreshes the server-backed session first.
   *
   * Use for:
   * - Applying partial session changes from client workflows
   * - Revalidating the NextAuth session before synchronizing local session state
   *
   * @param patch - The partial session fields to merge into the current auth session store
   * @param force - Whether to refresh the NextAuth session before writing to the local store
   * @returns A promise that resolves after any requested session refresh and store update complete
   */
  const updateSession = async (patch: SessionPatch, force = false) => {
    if (force) {
      await session.update();
    }
    store.setSession(patch);
  };

  // hydrate once on mount (restore sessionStorage -> store)
  useEffect(() => {
    store.hydrateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // set session when sign in.
  useEffect(() => {
    if (session.status !== "authenticated") return;
    if (!effectiveUserProfile) return;

    store.setSession({ user: effectiveUserProfile });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status, effectiveUserProfile]);

  // clear session and impersonation when sign out.
  useEffect(() => {
    if (session.status === "unauthenticated") {
      impersonation.reset();
      store.clearSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);

  return {
    ...session,
    current,
    updateSession,
    hydrateSession: store.hydrateSession,
    clearSession: store.clearSession,
  };
};
