import { useCurrentSession } from "@/hooks/useCurrentSession";

export function useTicketDraftRepoContext() {
  const { data: currentSession } = useCurrentSession();

  return {
    userId: currentSession?.user.id ?? null,
    dataScope: currentSession?.user.dataScope ?? "LOCAL",
    isReady: !!currentSession?.user,
  } as const;
}
