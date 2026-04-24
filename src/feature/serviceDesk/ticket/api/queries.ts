import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { serviceDeskTicketApi } from "@/feature/serviceDesk/ticket/api";
import { DYNAMIC_QUERY_OPTIONS } from "@/lib/reactQuery";
import { DbParams } from "@/shared/types/api";

import { ticketQueryKeys } from "./queryKeys";
import { serviceDeskTicketDraftRepo, useTicketDraftRepoContext } from "./repo";

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

export const useServiceDeskTicketDraftQuery = () => {
  const context = useTicketDraftRepoContext();

  return useQuery({
    queryKey: ticketQueryKeys.draft(context),
    queryFn: () => serviceDeskTicketDraftRepo.get(context),
    enabled: context.isReady,
    ...DYNAMIC_QUERY_OPTIONS,
  });
};
