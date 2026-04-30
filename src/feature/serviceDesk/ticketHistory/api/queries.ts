import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth";

import { getServiceDeskQueryOptions } from "../../shared/utils/queryOptions";
import { serviceDeskTicketHistoryApi } from "./api";
import { ticketHistoryQueryKeys } from "./queryKeys";

export const useServiceDeskTicketHistoryListQuery = (ticketId: string) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketHistoryQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketHistoryApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId,
    ...ticketQueryOptions,
  });
};
