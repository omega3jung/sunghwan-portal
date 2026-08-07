"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { SessionUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { userImpersonationApi } from "@/feature/auth/impersonation/api";
import { leftMenuQueryKeys } from "@/feature/navigation/leftMenu";
import { employeeQueryKeys } from "@/feature/organization/employee";
import { SERVICE_DESK_KEY } from "@/feature/serviceDesk/shared/keys";
import { userProfileQueryKeys } from "@/feature/user/profile";
import { useAuthSessionStore } from "@/lib/client/auth";
import { useImpersonationStore } from "@/lib/client/auth";

/**
 * Coordinates impersonation across NextAuth, the client identity store, and
 * identity-dependent query caches. Store synchronization waits for the fetched
 * profile to match the session identity so consumers never receive mixed users.
 */
export const useImpersonation = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const sessionUser = useAuthSessionStore((state) => state.user);
  const { originalUser, impersonatedUser, currentUser, syncFromSession } =
    useImpersonationStore();

  // Call only after NextAuth publishes the effective identity so refetches use the new user.
  const invalidateImpersonationDependentQueries = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: leftMenuQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: [SERVICE_DESK_KEY] }),
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all }),
    ]);

  const startImpersonation = async (impersonatedUsername: string) => {
    const impersonation =
      await userImpersonationApi.start(impersonatedUsername);
    await session.update({ impersonation });
    await invalidateImpersonationDependentQueries();
  };

  const stopImpersonation = async () => {
    await userImpersonationApi.stop();
    await session.update({ impersonation: null });
    await invalidateImpersonationDependentQueries();
  };

  useEffect(() => {
    if (!sessionUser) {
      return;
    }

    const impersonatedUsername =
      session.data?.impersonation?.impersonatedUser.username ?? null;
    const originalUsername = session.data?.impersonation?.originalUser.username;
    const sessionAuthUser = session.data?.user ?? null;

    if (impersonatedUsername) {
      // Wait until the session-facing user has switched to the impersonated profile.
      if (sessionUser.username !== impersonatedUsername) return;

      const fallbackOriginalUser =
        originalUsername && sessionAuthUser?.username === originalUsername
          ? toAppUserFromSessionUser(sessionAuthUser)
          : null;

      const resolvedOriginalUser =
        originalUser?.username === originalUsername
          ? originalUser
          : fallbackOriginalUser;

      if (!resolvedOriginalUser) return;

      if (
        impersonatedUser?.username === sessionUser.username &&
        originalUser?.username === resolvedOriginalUser.username &&
        currentUser?.username === sessionUser.username
      ) {
        return;
      }

      syncFromSession({
        originalUser: resolvedOriginalUser,
        impersonatedUser: sessionUser,
      });
    } else {
      // During stop impersonation, wait until the session user snaps back to original.
      if (originalUser && sessionUser.username !== originalUser.username) {
        return;
      }

      if (
        !impersonatedUser &&
        originalUser?.username === sessionUser.username &&
        currentUser?.username === sessionUser.username
      ) {
        return;
      }

      syncFromSession({ originalUser: sessionUser, impersonatedUser: null });
    }
    // Full store objects change during synchronization; identity-only dependencies avoid a feedback loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    originalUser?.username,
    sessionUser?.username,
    session.data?.impersonation?.originalUser.username,
    session.data?.impersonation?.impersonatedUser.username,
    syncFromSession,
  ]);

  return {
    originalUser,
    impersonatedUser,
    currentUser,
    isImpersonating: !!session.data?.impersonation?.impersonatedUser.username,
    startImpersonation,
    stopImpersonation,
  };
};

function toAppUserFromSessionUser(user: SessionUser): AppUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    userScope: user.userScope,
    companyId: user.companyId,
    permission: user.permission,
    canUseSuperUser: user.role === "ADMIN",
    canUseImpersonation: user.role === "ADMIN",
  };
}
