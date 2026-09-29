"use client";

import { useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "@/feature/serviceDesk/shared/client";

import { serviceDeskTicketActionApi } from "./api";
import { ticketActionQueryKeys } from "./queryKeys";

export const useServiceDeskTicketActionListQuery = (ticketId: string) => {
  const { dataScope, effectiveUsername, identityKey, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: [...ticketActionQueryKeys.list(ticketId), ...identityKey],
    queryFn: () => serviceDeskTicketActionApi.list(ticketId),
    enabled: !!ticketId && !!dataScope && !!effectiveUsername,
    ...queryOptions,
  });
};

export const useServiceDeskTicketActionQuery = (
  ticketId: string,
  actionNo: string,
) => {
  const { dataScope, effectiveUsername, identityKey, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: [...ticketActionQueryKeys.detail(ticketId, actionNo), ...identityKey],
    queryFn: () => serviceDeskTicketActionApi.get(ticketId, actionNo),
    enabled: !!ticketId && !!actionNo && !!dataScope && !!effectiveUsername,
    ...queryOptions,
  });
};
