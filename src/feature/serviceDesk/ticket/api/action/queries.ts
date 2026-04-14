import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { serviceDeskTicketActionApi } from "@/api/serviceDesk/ticket/action";
import { DYNAMIC_QUERY_OPTIONS } from "@/lib/reactQuery";

import { ticketActionQueryKeys } from "./queryKeys";

export const useServiceDeskTicketActionListQuery = (ticketId: string) => {
  return useQuery({
    queryKey: ticketActionQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketActionApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskTicketActionQuery = (
  ticketId: string,
  actionNo: string,
) => {
  return useQuery({
    queryKey: ticketActionQueryKeys.detail(ticketId, actionNo),
    queryFn: () => serviceDeskTicketActionApi.get(ticketId, actionNo),
    enabled: !!ticketId && !!actionNo,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};
