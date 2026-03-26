import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { serviceDeskTicketApi } from "@/api/serviceDesk/ticket";
import { DYNAMIC_QUERY_OPTIONS } from "@/lib/reactQuery";
import { DbParams } from "@/shared/types/api";

import { ticketQueryKeys } from "./queryKeys";

export const useServiceDeskTicketListQuery = (params: DbParams) => {
  return useQuery({
    queryKey: ticketQueryKeys.list(params),
    queryFn: () => serviceDeskTicketApi.list(params),
    placeholderData: keepPreviousData,
    enabled: !!params,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskTicketQuery = (id: string | number) => {
  return useQuery({
    queryKey: ticketQueryKeys.detail(id),
    queryFn: () => serviceDeskTicketApi.get(String(id)),
    enabled: !!id,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};

export const useServiceDeskTicketDraftQuery = (userId?: string | null) => {
  return useQuery({
    queryKey: ticketQueryKeys.all,
    queryFn: () => serviceDeskTicketApi.draft.get(userId),
    enabled: !!userId,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};
