"use client";

import { useCurrentSession } from "@/feature/auth/session/client";

import { getServiceDeskQueryOptions } from "../utils/queryOptions";

export function useServiceDeskQueryOptions() {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;

  return {
    dataScope,
    queryOptions: getServiceDeskQueryOptions(dataScope),
  };
}
