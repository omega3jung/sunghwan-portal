"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "@/feature/serviceDesk/shared/hooks/useServiceDeskQueryOptions";

import { serviceDeskTicketWorkSessionApi } from "./api";
import { ticketWorkSessionQueryKeys } from "./queryKeys";

export const useServiceDeskTicketWorkSessionListQuery = (ticketId: string) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: ticketWorkSessionQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketWorkSessionApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId && !!dataScope,
    ...queryOptions,
  });
};

export const useServiceDeskTicketWorkSessionQuery = (
  ticketId: string,
  workSessionNo: string,
) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: ticketWorkSessionQueryKeys.detail(ticketId, workSessionNo),
    queryFn: () => serviceDeskTicketWorkSessionApi.get(ticketId, workSessionNo),
    enabled: !!ticketId && !!workSessionNo && !!dataScope,
    ...queryOptions,
  });
};
