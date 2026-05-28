// hooks/useImpersonation.ts
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { userImpersonationApi } from "@/feature/auth/impersonation/api";
import { useCurrentSession } from "@/feature/auth/session/hooks/useCurrentSession";
import { userProfileApi } from "@/feature/user/profile";
import { useImpersonationStore } from "@/lib/impersonationStore";

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
  const { current } = useCurrentSession();
  const session = useSession();
  const {
    originalUser,
    impersonatedUser,
    currentUser,
    syncFromSession,
    reset,
  } = useImpersonationStore();

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
  };

  // Store synchronization when session changed.
  useEffect(() => {
    if (!current?.user) {
      reset();
      return;
    }

    const impersonatedUsername =
      session.data?.impersonation?.impersonatedUser.username ?? null;

    // impersonating.
    if (impersonatedUsername) {
      // ??if same impersonatedUser, then do nothing.
      if (impersonatedUser?.username === impersonatedUsername) return;

      // get impersonatedUser user.
      userProfileApi
        .get(impersonatedUsername)
        .then((impersonatedUserProfile) => {
          syncFromSession({
            originalUser: originalUser ?? current.user!,
            impersonatedUser: impersonatedUserProfile,
          });
        });
    } else {
      syncFromSession({ originalUser: current.user, impersonatedUser: null });
    }
    // optimized to dependencies. Do not update this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    current.user?.username,
    session.data?.impersonation?.impersonatedUser.username,
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
