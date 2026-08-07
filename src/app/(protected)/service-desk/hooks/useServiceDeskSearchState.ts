import { useEffect, useRef, useState } from "react";

import type { CategoryScope } from "@/domain/serviceDesk";
import { SERVICE_DESK_KEY } from "@/feature/serviceDesk/shared/keys";
import { useServiceDeskTicketSearchQuery } from "@/feature/serviceDesk/ticket/client";
import {
  normalizeTicketSearchCriteriaFormValues,
  ticketSearchCriteriaFormDefaultValues,
  type TicketSearchCriteriaFormValues,
} from "@/feature/serviceDesk/ticketSearch";
import { useTicketSearchCriteriaForm } from "@/feature/serviceDesk/ticketSearch/client";
import { useSessionStorageState } from "@/shared/client/useSessionStorageState";

export const TICKET_PAGE_SIZE = 10;

export type ServiceDeskSortOrder = "asc" | "desc";
export type ServiceDeskSortOption =
  | "ticketNumber"
  | "createdAt"
  | "dueAt"
  | "priority";
export type ServiceDeskViewOption = CategoryScope;

type TicketSearchState = TicketSearchCriteriaFormValues & {
  page: number;
  order: ServiceDeskSortOrder;
  scope: ServiceDeskViewOption;
  sort: ServiceDeskSortOption;
};

const ticketSearchStateDefaultValues: TicketSearchState = {
  ...ticketSearchCriteriaFormDefaultValues,
  page: 1,
  order: "desc",
  scope: "INTERNAL",
  sort: "ticketNumber",
};

export function useServiceDeskSearchState() {
  const searchCriteriaState = useSessionStorageState<TicketSearchState>({
    key: SERVICE_DESK_KEY,
    initialValue: ticketSearchStateDefaultValues,
  });
  const form = useTicketSearchCriteriaForm();
  const restoredSearchStateRef = useRef(false);
  const [criteria, setCriteria] = useState<TicketSearchCriteriaFormValues>(
    ticketSearchCriteriaFormDefaultValues,
  );
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<ServiceDeskSortOrder>("desc");
  const [scope, setScope] = useState<ServiceDeskViewOption>("INTERNAL");
  const [sort, setSort] =
    useState<ServiceDeskSortOption>("ticketNumber");

  const {
    data: ticketSearchResult,
    isLoading: isTicketListLoading,
    refetch: refetchTickets,
  } = useServiceDeskTicketSearchQuery({
    criteria: {
      ...criteria,
      cat_scope: scope,
    },
    sort,
    order,
    page,
    pageSize: TICKET_PAGE_SIZE,
    enabled: searchCriteriaState.hydrated,
  });

  const tickets = ticketSearchResult?.items ?? [];
  const totalCount = ticketSearchResult?.totalCount ?? 0;

  useEffect(() => {
    if (ticketSearchResult?.page !== page) {
      return;
    }

    const totalPages = Math.ceil(totalCount / TICKET_PAGE_SIZE);

    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
      searchCriteriaState.setValue((previous) => ({
        ...previous,
        page: totalPages,
      }));
    }
  }, [page, searchCriteriaState, ticketSearchResult?.page, totalCount]);

  useEffect(() => {
    if (!searchCriteriaState.hydrated || restoredSearchStateRef.current) {
      return;
    }

    restoredSearchStateRef.current = true;

    const {
      page: restoredPage = 1,
      order: restoredOrder = "desc",
      scope: restoredScope = "INTERNAL",
      sort: restoredSort = "ticketNumber",
      ...storedCriteria
    } = searchCriteriaState.value;
    const restoredCriteria =
      normalizeTicketSearchCriteriaFormValues(storedCriteria);

    form.reset(restoredCriteria);
    setCriteria(restoredCriteria);
    setPage(restoredPage);
    setOrder(restoredOrder);
    setScope(restoredScope);
    setSort(restoredSort);
  }, [form, searchCriteriaState.hydrated, searchCriteriaState.value]);

  const submitSearch = async (values: TicketSearchCriteriaFormValues) => {
    const nextCriteria = normalizeTicketSearchCriteriaFormValues(values);

    searchCriteriaState.setValue({
      ...nextCriteria,
      page: 1,
      order,
      scope,
      sort,
    });
    setCriteria(nextCriteria);
    setPage(1);
  };

  const changeSort = (nextSort: ServiceDeskSortOption) => {
    setSort(nextSort);
    setPage(1);
    searchCriteriaState.setValue((previous) => ({
      ...previous,
      sort: nextSort,
      page: 1,
    }));
  };

  const toggleOrder = () => {
    const nextOrder = order === "desc" ? "asc" : "desc";

    setOrder(nextOrder);
    setPage(1);
    searchCriteriaState.setValue((previous) => ({
      ...previous,
      order: nextOrder,
      page: 1,
    }));
  };

  const changeScope = (nextScope: ServiceDeskViewOption) => {
    setScope(nextScope);
    setPage(1);
    searchCriteriaState.setValue((previous) => ({
      ...previous,
      scope: nextScope,
      page: 1,
    }));
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    searchCriteriaState.setValue((previous) => ({
      ...previous,
      page: nextPage,
    }));
  };

  return {
    form,
    tickets,
    ticketSearchResult,
    totalCount,
    isTicketListLoading,
    page,
    pageSize: TICKET_PAGE_SIZE,
    order,
    scope,
    sort,
    submitSearch,
    changeSort,
    toggleOrder,
    changeScope,
    changePage,
    refetchTickets,
  };
}
