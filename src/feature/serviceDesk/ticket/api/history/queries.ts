import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { serviceDeskTicketHistoryApi } from "@/api/serviceDesk/ticket/history";
import { DYNAMIC_QUERY_OPTIONS } from "@/lib/reactQuery";

import { ticketHistoryQueryKeys } from "./queryKeys";

export const useServiceDeskTicketHistoryListQuery = (ticketId: string) => {
  return useQuery({
    queryKey: ticketHistoryQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketHistoryApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};
