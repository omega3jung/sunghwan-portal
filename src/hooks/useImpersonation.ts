// hooks/useImpersonation.ts
import React from "react";

import { userProfileApi } from "@/feature/user/profile/api";
import { useImpersonationStore } from "@/lib/impersonationStore";

import { useCurrentSession } from "./useCurrentSession";

export const useImpersonation = () => {
  const { current } = useCurrentSession();
  const { actor, subject, effective, syncFromSession, reset } =
    useImpersonationStore();

  // Store synchronization when session changed.
  React.useEffect(() => {
    if (!current?.user) {
      reset();
      return;
    }

    // impersonating.
    if (subject) {
      // fetch subject user.

      userProfileApi.fetch(current.user.id).then((subjectProfile) => {
        syncFromSession({
          actor: actor ?? current.user!,
          subject: subjectProfile,
        });
      });
    } else {
      syncFromSession({ actor: current.user, subject: null });
    }
  }, [current.user, subject]);

  return {
    actor,
    subject,
    effective,
    isImpersonating: !!subject,
  };
};
