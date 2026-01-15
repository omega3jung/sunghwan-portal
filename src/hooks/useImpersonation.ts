// hooks/useImpersonation.ts
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import { userImpersonationApi } from "@/feature/user/impersonation/api";
import { userProfileApi } from "@/feature/user/profile/api";
import { useImpersonationStore } from "@/lib/impersonationStore";

import { useCurrentSession } from "./useCurrentSession";

export const useImpersonation = () => {
  const { current } = useCurrentSession();
  const session = useSession();
  const { actor, subject, effective, syncFromSession, reset } =
    useImpersonationStore();

  const startImpersonation = async (subjectId: string) => {
    const impersonation = await userImpersonationApi.start(subjectId);
    await session.update(impersonation);
  };

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

      // fetch subject user.
      userProfileApi.fetch(impersonationSubjectId).then((subjectProfile) => {
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
