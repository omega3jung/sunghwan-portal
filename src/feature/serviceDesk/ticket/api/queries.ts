"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useServiceDeskQueryOptions } from "@/feature/serviceDesk/shared/hooks/useServiceDeskQueryOptions";
import {
  type TicketSearchRequest,
  type TicketSortField,
} from "@/feature/serviceDesk/ticket/api/types";
import type { TicketSearchCriteriaFormValues } from "@/feature/serviceDesk/ticketSearch";
import { mapSearchCriteriaToDbParams } from "@/feature/serviceDesk/ticketSearch/utils";
import { DbParams, type SortDirection } from "@/shared/types";

import { serviceDeskTicketApi } from "./api";
import { ticketQueryKeys } from "./queryKeys";

export const useServiceDeskTicketListQuery = (params: DbParams) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: ticketQueryKeys.list(params),
    queryFn: () => serviceDeskTicketApi.list(params),
    placeholderData: keepPreviousData,
    enabled: !!params && !!dataScope,
    ...queryOptions,
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
    sortField: sort,
    sortDirection: order,
    page,
    pageSize,
  };

  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: ticketQueryKeys.search(request),
    queryFn: () => serviceDeskTicketApi.search(request),
    placeholderData: keepPreviousData,
    enabled: enabled && !!dataScope,
    ...queryOptions,
  });
};

export const useServiceDeskTicketQuery = (id: string | number) => {
  const { dataScope, queryOptions } = useServiceDeskQueryOptions();

  return useQuery({
    queryKey: ticketQueryKeys.detail(id),
    queryFn: () => serviceDeskTicketApi.get(String(id)),
    enabled: !!id && !!dataScope,
    ...queryOptions,
  });
};
