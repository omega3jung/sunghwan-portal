// hooks/useImpersonation.ts
import { useImpersonationStore } from "@/lib/impersonationStore";

export const useImpersonation = () => {
  const {
    actor,
    subject,
    effective,
    setActor,
    startImpersonation,
    stopImpersonation,
    reset,
  } = useImpersonationStore();

  const isImpersonating = !!subject;

  return {
    actor,
    subject,
    effective,
    isImpersonating,

    // 명확한 의미를 가진 API만 노출
    setActor,
    startImpersonation,
    stopImpersonation,
    reset,
  };
};
