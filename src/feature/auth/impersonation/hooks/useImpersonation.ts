// hooks/useImpersonation.ts
"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { SessionUser } from "@/domain/auth";
import { AppUser } from "@/domain/user";
import { userImpersonationApi } from "@/feature/auth/impersonation/api";
import { leftMenuQueryKeys } from "@/feature/navigation/leftMenu";
import { userProfileQueryKeys } from "@/feature/user/profile";
import { useAuthSessionStore } from "@/lib/client/auth";
import { useImpersonationStore } from "@/lib/client/auth";

/**
 * Provides impersonation state and actions for starting, stopping, and syncing impersonation sessions.
 *
 * Use for:
 * - Managing admin impersonation flows from client components
 * - Reading current user context alongside original and impersonated users
 *
 * @param none - This hook does not accept any arguments
 * @returns An impersonation facade containing originalUser, impersonatedUser, currentUser state, and control actions
 */
export const useImpersonation = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const sessionUser = useAuthSessionStore((state) => state.user);
  const { originalUser, impersonatedUser, currentUser, syncFromSession } =
    useImpersonationStore();

  const invalidateImpersonationDependentQueries = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: leftMenuQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all }),
    ]);

  /**
   * Starts impersonation for a target user and refreshes the session with the returned impersonation payload.
   *
   * Use for:
   * - Entering impersonation mode from an admin control flow
   * - Switching the current session context to another user
   *
   * @param impersonatedUsername - The username of the user to impersonate
   * @returns A promise that resolves after the impersonation request and session update complete
   */
  const startImpersonation = async (impersonatedUsername: string) => {
    const impersonation =
      await userImpersonationApi.start(impersonatedUsername);
    await session.update({ impersonation });
    await invalidateImpersonationDependentQueries();
  };

  /**
   * Stops the current impersonation session and clears impersonation data from the active session.
   *
   * Use for:
   * - Exiting impersonation mode from the UI
   * - Restoring the original user as the only active session identity
   *
   * @param none - This function does not accept any arguments
   * @returns A promise that resolves after the impersonation session is cleared and the session is updated
   */
  const stopImpersonation = async () => {
    await userImpersonationApi.stop();
    await session.update({ impersonation: null });
    await invalidateImpersonationDependentQueries();
  };

  // Store synchronization when session changed.
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
    // optimized to dependencies. Do not update this.
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
