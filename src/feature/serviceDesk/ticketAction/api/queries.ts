"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "@/feature/serviceDesk/shared/hooks/useServiceDeskQueryOptions";

import { serviceDeskTicketActionApi } from "./api";
import { ticketActionQueryKeys } from "./queryKeys";

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
