"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "@/feature/serviceDesk/shared/hooks/useServiceDeskQueryOptions";

import { serviceDeskTicketHistoryApi } from "./api";
import { ticketHistoryQueryKeys } from "./queryKeys";

export const useServiceDeskTicketHistoryListQuery = (ticketId: string) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: ticketHistoryQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketHistoryApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId && !!dataScope,
    ...queryOptions,
  });
};
