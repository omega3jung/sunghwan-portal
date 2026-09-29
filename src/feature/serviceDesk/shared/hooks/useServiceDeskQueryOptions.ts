"use client";

import { useCurrentSession } from "@/feature/auth/session/client";

import { getServiceDeskQueryOptions } from "../utils/queryOptions";

export function useServiceDeskQueryOptions() {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const effectiveUsername = currentSession?.impersonation?.impersonatedUser.username
    ?? currentSession?.user.username;

  return {
    dataScope,
    effectiveUsername,
    identityKey: [dataScope, effectiveUsername] as const,
    queryOptions: getServiceDeskQueryOptions(dataScope),
  };
}
