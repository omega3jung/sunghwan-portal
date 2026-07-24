import { DYNAMIC_QUERY_OPTIONS } from "@/lib/client/query";

const LOCAL_DEMO_GC_TIME = 1000 * 60 * 60 * 24; // 24h

// to give enough time to play demo.
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
