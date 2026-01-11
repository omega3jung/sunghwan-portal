// hooks/useImpersonation.ts
import { useSession } from "next-auth/react";
import React from "react";

import { userProfileApi } from "@/lib/api";
import { useImpersonationStore } from "@/lib/impersonationStore";
import { mapAuthUserToAppUser } from "@/server/auth/mapAuthUserToAppUser";

export const useImpersonation = () => {
  const { data: session } = useSession();
  const { actor, subject, effective, syncFromSession, reset } =
    useImpersonationStore();

  // Store synchronization when session changed.
  React.useEffect(() => {
    if (!session?.user) {
      reset();
      return;
    }

    const effectiveUser = mapAuthUserToAppUser(session.user, {});

    // impersonating.
    if (session.impersonation?.subjectId) {
      // fetch subject user.

      userProfileApi.fetch(effectiveUser.id).then((subjectProfile) => {
        syncFromSession({
          actor: actor ?? effectiveUser,
          subject: subjectProfile,
        });
      });
    } else {
      syncFromSession({ actor: effectiveUser, subject: null });
    }
  }, [session?.user, session?.impersonation]);

  return {
    actor,
    subject,
    effective,
    isImpersonating: !!subject,
  };
};
