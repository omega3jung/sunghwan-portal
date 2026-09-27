"use client";

import { useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "@/feature/serviceDesk/shared/client";

import { serviceDeskTicketHistoryApi } from "./api";
import { ticketHistoryQueryKeys } from "./queryKeys";

export const useServiceDeskTicketHistoryListQuery = (ticketId: string) => {
  const { dataScope, effectiveUsername, identityKey, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: [...ticketHistoryQueryKeys.list(ticketId), ...identityKey],
    queryFn: () => serviceDeskTicketHistoryApi.list(ticketId),
    enabled: !!ticketId && !!dataScope && !!effectiveUsername,
    ...queryOptions,
  });
};
