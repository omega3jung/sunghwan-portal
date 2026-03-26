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
 * - Reading the effective user alongside actor and subject information
 *
 * @param none - This hook does not accept any arguments
 * @returns An impersonation facade containing actor, subject, effective user state, and control actions
 */
export const useImpersonation = () => {
  const { current } = useCurrentSession();
  const session = useSession();
  const { actor, subject, effective, syncFromSession, reset } =
    useImpersonationStore();

  /**
   * Starts impersonation for a target user and refreshes the session with the returned impersonation payload.
   *
   * Use for:
   * - Entering impersonation mode from an admin control flow
   * - Switching the effective session context to another user
   *
   * @param subjectId - The id of the user to impersonate
   * @returns A promise that resolves after the impersonation request and session update complete
   */
  const startImpersonation = async (subjectId: string) => {
    const impersonation = await userImpersonationApi.start(subjectId);
    await session.update(impersonation);
  };

  /**
   * Stops the current impersonation session and clears impersonation data from the active session.
   *
   * Use for:
   * - Exiting impersonation mode from the UI
   * - Restoring the original actor as the only active session identity
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

    const impersonationSubjectId =
      session.data?.impersonation?.subjectId ?? null;

    // impersonating.
    if (impersonationSubjectId) {
      // ✅ if same subject, then do nothing.
      if (subject?.id === impersonationSubjectId) return;

      // get subject user.
      userProfileApi.get(impersonationSubjectId).then((subjectProfile) => {
        syncFromSession({
          actor: actor ?? current.user!,
          subject: subjectProfile,
        });
      });
    } else {
      syncFromSession({ actor: current.user, subject: null });
    }
  }, [current.user?.id, session.data?.impersonation?.subjectId]);

  return {
    actor,
    subject,
    effective,
    isImpersonating: !!session.data?.impersonation?.subjectId,
    startImpersonation,
    stopImpersonation,
  };
};
