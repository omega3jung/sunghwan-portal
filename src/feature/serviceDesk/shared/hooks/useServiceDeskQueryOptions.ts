"use client";

import { useCurrentSession } from "@/feature/auth/session/client";

import { getServiceDeskQueryOptions } from "../utils/queryOptions";

/** Selects Service Desk cache timing from the current LOCAL or remote data scope. */
export function useServiceDeskQueryOptions() {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;

  return {
    dataScope,
    queryOptions: getServiceDeskQueryOptions(dataScope),
  };
}
