import { DYNAMIC_QUERY_OPTIONS } from "@/lib/client/query";

const LOCAL_DEMO_GC_TIME = 1000 * 60 * 60 * 24; // 24h

/**
 * Adjusts cache lifetime and background refresh for the selected runtime.
 *
 * LOCAL keeps inactive demo queries available for a day and avoids focus or
 * reconnect churn, but still refetches on mount. React Query remains a client
 * cache in both modes; the LOCAL API adapter's process state and the REMOTE
 * database are their respective sources of truth.
 */
export function getServiceDeskQueryOptions(dataScope?: "LOCAL" | "REMOTE") {
  if (dataScope === "LOCAL") {
    return {
      ...DYNAMIC_QUERY_OPTIONS,
      gcTime: LOCAL_DEMO_GC_TIME,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: "always" as const,
    };
  }

  return DYNAMIC_QUERY_OPTIONS;
}
