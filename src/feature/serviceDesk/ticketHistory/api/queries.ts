import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { DYNAMIC_QUERY_OPTIONS } from "@/lib/reactQuery";

import { serviceDeskTicketHistoryApi } from "./api";
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
