import { DYNAMIC_QUERY_OPTIONS } from "@/lib/reactQuery";

const LOCAL_DEMO_STALE_TIME = 1000 * 60 * 60 * 24; // 24h
const LOCAL_DEMO_GC_TIME = 1000 * 60 * 60 * 24; // 24h

// to give enough time to play demo.
export function getServiceDeskQueryOptions(dataScope?: "LOCAL" | "REMOTE") {
  if (dataScope === "LOCAL") {
    return {
      ...DYNAMIC_QUERY_OPTIONS,
      staleTime: LOCAL_DEMO_STALE_TIME,
      gcTime: LOCAL_DEMO_GC_TIME,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    };
  }

  return DYNAMIC_QUERY_OPTIONS;
}
