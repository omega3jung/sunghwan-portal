import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth";

import { getServiceDeskQueryOptions } from "../../shared/utils/queryOptions";
import { serviceDeskTicketTrackTimeApi } from "./api";
import { ticketTrackTimeQueryKeys } from "./queryKeys";

export const useServiceDeskTicketTrackTimeListQuery = (ticketId: string) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketTrackTimeQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketTrackTimeApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId,
    ...ticketQueryOptions,
  });
};

export const useServiceDeskTicketTrackTimeQuery = (
  ticketId: string,
  trackTimeNo: string,
) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketTrackTimeQueryKeys.detail(ticketId, trackTimeNo),
    queryFn: () => serviceDeskTicketTrackTimeApi.get(ticketId, trackTimeNo),
    enabled: !!ticketId && !!trackTimeNo,
    ...ticketQueryOptions,
  });
};
