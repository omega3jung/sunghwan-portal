// hooks/useImpersonation.ts
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { userImpersonationApi } from "@/api/auth";
import { userProfileApi } from "@/api/user";
import { useImpersonationStore } from "@/lib/impersonationStore";

import { useCurrentSession } from "./useCurrentSession";

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
  } =
    useImpersonationStore();

  /**
   * Starts impersonation for a target user and refreshes the session with the returned impersonation payload.
   *
   * Use for:
   * - Entering impersonation mode from an admin control flow
   * - Switching the current session context to another user
   *
   * @param impersonatedUserId - The id of the user to impersonate
   * @returns A promise that resolves after the impersonation request and session update complete
   */
  const startImpersonation = async (impersonatedUserId: string) => {
    const impersonation = await userImpersonationApi.start(impersonatedUserId);
    await session.update(impersonation);
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

    const originalUserId = session.data?.user.id ?? null;
    const impersonatedUserId =
      session.data?.impersonation?.impersonatedUserId ?? null;

    if (!originalUserId) {
      reset();
      return;
    }

    if (impersonatedUserId) {
      const originalUserPromise =
        originalUser?.id === originalUserId
          ? Promise.resolve(originalUser)
          : userProfileApi.get(originalUserId);

      const impersonatedUserPromise =
        impersonatedUser?.id === impersonatedUserId
          ? Promise.resolve(impersonatedUser)
          : userProfileApi.get(impersonatedUserId);

      Promise.all([originalUserPromise, impersonatedUserPromise]).then(
        ([resolvedOriginalUser, resolvedImpersonatedUser]) => {
          syncFromSession({
            originalUser: resolvedOriginalUser,
            impersonatedUser: resolvedImpersonatedUser,
          });
        },
      );
    } else {
      syncFromSession({
        originalUser: current.user,
        impersonatedUser: null,
      });
    }
  }, [
    current.user?.id,
    impersonatedUser?.id,
    originalUser?.id,
    reset,
    session.data?.impersonation?.impersonatedUserId,
    session.data?.user.id,
    syncFromSession,
  ]);

  return {
    originalUser,
    impersonatedUser,
    currentUser,
    isImpersonating: !!session.data?.impersonation?.impersonatedUserId,
    startImpersonation,
    stopImpersonation,
  };
};
