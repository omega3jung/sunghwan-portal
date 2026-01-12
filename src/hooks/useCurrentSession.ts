import { useSession } from "next-auth/react";
import { useEffect, useMemo } from "react";

import { meApi } from "@/lib/api";
import { useImpersonationStore } from "@/lib/impersonationStore";
import { SessionPatch, useSessionStore } from "@/lib/sessionStore";
import { CurrentSession, UseCurrentSessionResult } from "@/types";

/*
 * =========================================================
 * useCurrentSession Hook
 * ---------------------------------------------------------
 * Role:
 * - Combines next-auth session + sessionStore (zustand)
 * - Processes it into a form suitable for use in UI/pages
 *
 * Purpose of this hook:
 * ❌ Prevents direct access to sessionStorage
 * ❌ Prevents direct access to the zustand store
 * ✅ Focuses solely on "how to use the session"
 *
 * In other words, a session facade (middle layer) for the frontend
 * =======================================================================================
 */

export const useCurrentSession = (): UseCurrentSessionResult => {
  /*
   * next-auth session.
   * - authorization status (loading, authenticated / unauthenticated)
   * - expires
   */
  const session = useSession();

  /*
   * zustand session store.
   * - dataScope
   * - isSuperUser
   * - user: { id, name, email, dataScope }
   * - accessToken
   */
  const store = useSessionStore();

  /*
   * zustand impersonation user store.
   * - actor
   * - subject
   */
  const impersonation = useImpersonationStore();

  /*
   * 🔒 From here on, authenticated is guaranteed at the type level.
   *
   * Processing session data for direct use in the UI.
   *
   * Principles:
   * - Eliminate calculation logic from page/component.
   * - Only update this hook when the session data structure changes.
   */
  const current = useMemo<CurrentSession>(() => {
    const isDemoUser = session.data?.user?.dataScope === "LOCAL";

    if (!store.user) {
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
      user: store.user,
      expires: "",
      isDemoUser,
      isSuperUser: store.isSuperUser,
      superUserActivated: store.superUserActivated,
      security: store.security,
    };
  }, [store]);

  /*
   * Single entry point for session updates
   *
   * force = true:
   * - Force revalidation of the next-auth session
   * - Renew the zustand session afterward
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
    if (!session.data?.user) return;

    meApi.get().then((appUser) => {
      store.setSession({
        user: appUser,
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status, session.data?.user]);

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
