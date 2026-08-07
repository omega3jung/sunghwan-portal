"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";

import { CurrentSession } from "@/domain/auth";
import { useCurrentUserProfileQuery } from "@/feature/user/profile/client";
import { SessionPatch, useAuthSessionStore } from "@/lib/client/auth";
import { useImpersonationStore } from "@/lib/client/auth";

import { UseCurrentSessionResult } from "../types";

const EMPTY_SECURITY: CurrentSession["security"] = {
  loginLockedUntil: null,
  failedAttempts: 0,
  requiresCaptcha: false,
};

/**
 * Exposes a null-safe UI session assembled from NextAuth, the current profile,
 * and the local runtime cache. NextAuth owns authentication; the store only
 * caches the richer application user and client-side session flags.
 */
export const useCurrentSession = (): UseCurrentSessionResult => {
  const session = useSession();

  const { data: currentUserProfile } = useCurrentUserProfileQuery(session.data);

  // Slice subscriptions keep unrelated store updates from rerendering every session consumer.
  const user = useAuthSessionStore((state) => state.user);
  const isSuperUser = useAuthSessionStore((state) => state.isSuperUser);
  const superUserActivated = useAuthSessionStore(
    (state) => state.superUserActivated,
  );
  const security = useAuthSessionStore((state) => state.security);

  const setSession = useAuthSessionStore((state) => state.setSession);
  const hydrateSession = useAuthSessionStore((state) => state.hydrateSession);
  const clearSession = useAuthSessionStore((state) => state.clearSession);

  const resetImpersonation = useImpersonationStore((state) => state.reset);

  const dataScope = session.data?.user?.dataScope;
  const expires = session.data?.expires ?? "";
  const effectiveUsername =
    session.data?.impersonation?.impersonatedUser.username ??
    session.data?.user.username ??
    null;

  // During impersonation transitions, reject cached profiles from the previous identity.
  const effectiveUser =
    currentUserProfile?.username === effectiveUsername
      ? currentUserProfile
      : user?.username === effectiveUsername
        ? user
        : null;

  const current = useMemo<CurrentSession>(() => {
    const isDemoUser = dataScope === "LOCAL";
    const isClient = effectiveUser?.userScope === "CLIENT";

    return {
      user: effectiveUser,
      expires,

      isDemoUser,

      isSuperUser: effectiveUser ? isSuperUser : false,
      isClient: effectiveUser ? isClient : false,
      superUserActivated: effectiveUser ? superUserActivated : null,
      security: effectiveUser ? security : EMPTY_SECURITY,
    };
  }, [
    dataScope,
    effectiveUser,
    expires,
    isSuperUser,
    security,
    superUserActivated,
  ]);

  // `force` refreshes NextAuth before applying the caller's local cache patch.
  const updateSession = useCallback(
    async (patch: SessionPatch, force = false) => {
      if (force) {
        await session.update();
      }

      setSession(patch);
    },
    [session, setSession],
  );

  // Restore the persisted snapshot first; authenticated profile data replaces it when ready.
  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (session.status !== "authenticated") return;
    if (!currentUserProfile) return;

    setSession({ user: currentUserProfile });
  }, [currentUserProfile, session.status, setSession]);

  // Logout must clear both identity stores to prevent stale impersonation state.
  useEffect(() => {
    if (session.status !== "unauthenticated") return;

    resetImpersonation();
    clearSession();
  }, [clearSession, resetImpersonation, session.status]);

  return {
    ...session,
    current,
    updateSession,
    hydrateSession,
    clearSession,
  };
};
