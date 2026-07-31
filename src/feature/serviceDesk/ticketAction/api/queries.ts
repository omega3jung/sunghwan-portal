"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "@/feature/serviceDesk/shared/client";

import { serviceDeskTicketActionApi } from "./api";
import { ticketActionQueryKeys } from "./queryKeys";

/** Provides the client query hook for service desk ticket action list query and its cache policy. */
export const useServiceDeskTicketActionListQuery = (ticketId: string) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: ticketActionQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketActionApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId && !!dataScope,
    ...queryOptions,
  });
};

/** Provides the client query hook for service desk ticket action query and its cache policy. */
export const useServiceDeskTicketActionQuery = (
  ticketId: string,
  actionNo: string,
) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: ticketActionQueryKeys.detail(ticketId, actionNo),
    queryFn: () => serviceDeskTicketActionApi.get(ticketId, actionNo),
    enabled: !!ticketId && !!actionNo && !!dataScope,
    ...queryOptions,
  });
};
