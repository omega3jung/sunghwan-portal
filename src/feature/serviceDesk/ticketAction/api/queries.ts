"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth/session/client";

import { getServiceDeskQueryOptions } from "../../shared/utils/queryOptions";
import { serviceDeskTicketActionApi } from "./api";
import { ticketActionQueryKeys } from "./queryKeys";

export const useServiceDeskTicketActionListQuery = (ticketId: string) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketActionQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketActionApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId && !!dataScope,
    ...ticketQueryOptions,
  });
};

export const useServiceDeskTicketActionQuery = (
  ticketId: string,
  actionNo: string,
) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketActionQueryKeys.detail(ticketId, actionNo),
    queryFn: () => serviceDeskTicketActionApi.get(ticketId, actionNo),
    enabled: !!ticketId && !!actionNo && !!dataScope,
    ...ticketQueryOptions,
  });
};
