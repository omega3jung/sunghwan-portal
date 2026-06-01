import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth/session/client";

import { getServiceDeskQueryOptions } from "../../shared/utils/queryOptions";
import { serviceDeskTicketWorkSessionApi } from "./api";
import { ticketWorkSessionQueryKeys } from "./queryKeys";

export const useServiceDeskTicketWorkSessionListQuery = (ticketId: string) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketWorkSessionQueryKeys.list(ticketId),
    queryFn: () => serviceDeskTicketWorkSessionApi.list(ticketId),
    placeholderData: keepPreviousData,
    enabled: !!ticketId && !!dataScope,
    ...ticketQueryOptions,
  });
};

export const useServiceDeskTicketWorkSessionQuery = (
  ticketId: string,
  workSessionNo: string,
) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketWorkSessionQueryKeys.detail(ticketId, workSessionNo),
    queryFn: () => serviceDeskTicketWorkSessionApi.get(ticketId, workSessionNo),
    enabled: !!ticketId && !!workSessionNo && !!dataScope,
    ...ticketQueryOptions,
  });
};
