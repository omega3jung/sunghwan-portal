import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useCurrentSession } from "@/feature/auth";
import {
  serviceDeskTicketApi,
  type TicketSearchRequest,
  type TicketSortField,
} from "@/feature/serviceDesk/ticket/api";
import type { TicketSearchCriteriaFormValues } from "@/feature/serviceDesk/ticketSearch";
import { mapSearchCriteriaToDbParams } from "@/feature/serviceDesk/ticketSearch/utils";
import { DYNAMIC_QUERY_OPTIONS } from "@/lib/reactQuery";
import { DbParams, type SortDirection } from "@/shared/types";

import { getServiceDeskQueryOptions } from "../../shared/utils/queryOptions";
import { ticketQueryKeys } from "./queryKeys";
import { serviceDeskTicketDraftRepo, useTicketDraftRepoContext } from "./repo";

export const useServiceDeskTicketListQuery = (params: DbParams) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;
  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketQueryKeys.list(params),
    queryFn: () => serviceDeskTicketApi.list(params),
    placeholderData: keepPreviousData,
    enabled: !!params,
    ...ticketQueryOptions,
  });
};

type UseServiceDeskTicketSearchQueryParams = {
  criteria: TicketSearchCriteriaFormValues;
  sort: TicketSortField;
  order: SortDirection;
  page: number;
  pageSize: number;
  enabled?: boolean;
};

export const useServiceDeskTicketSearchQuery = ({
  criteria,
  sort,
  order,
  page,
  pageSize,
  enabled = true,
}: UseServiceDeskTicketSearchQueryParams) => {
  const dbParams = mapSearchCriteriaToDbParams(criteria);

  const request: TicketSearchRequest = {
    filter: dbParams.filter,
    sort: {
      field: sort,
      direction: order,
    },
    page,
    pageSize,
  };

  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;

  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketQueryKeys.search(request),
    queryFn: () => serviceDeskTicketApi.search(request),
    placeholderData: keepPreviousData,
    enabled,
    ...ticketQueryOptions,
  });
};

export const useServiceDeskTicketQuery = (id: string | number) => {
  const { data: currentSession } = useCurrentSession();
  const dataScope = currentSession?.user.dataScope;

  const ticketQueryOptions = getServiceDeskQueryOptions(dataScope);

  return useQuery({
    queryKey: ticketQueryKeys.detail(id),
    queryFn: () => serviceDeskTicketApi.get(String(id)),
    enabled: !!id,
    ...ticketQueryOptions,
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
