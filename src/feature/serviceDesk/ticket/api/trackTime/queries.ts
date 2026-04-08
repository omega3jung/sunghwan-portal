import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { serviceDeskTicketTrackTimeApi } from "@/api/serviceDesk/ticket/trackTime";
import { DYNAMIC_QUERY_OPTIONS } from "@/lib/reactQuery";

import { ticketTrackTimeQueryKeys } from "./queryKeys";

export const useServiceDeskTicketTrackTimeListQuery = (ticketId: string) => {
  return useQuery({
    queryKey: ticketTrackTimeQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketTrackTimeApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskTicketTrackTimeQuery = (
  ticketId: string,
  trackTimeNo: string,
) => {
  return useQuery({
    queryKey: ticketTrackTimeQueryKeys.detail(ticketId, trackTimeNo),
    queryFn: () => serviceDeskTicketTrackTimeApi.get(ticketId, trackTimeNo),
    enabled: !!ticketId && !!trackTimeNo,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};
