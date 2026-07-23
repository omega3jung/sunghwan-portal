// src/app/(protected)/service-desk/page.tsx

"use client";

import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChartPie,
  ChevronDown,
  FlagTriangleRight,
  RefreshCw,
  Ticket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useRouteLoading } from "@/components/layout/RouteLoading";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CategoryScope, MainCategory } from "@/domain/serviceDesk";
import { useCurrentSession } from "@/feature/auth/session/client";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category/client";
import { SERVICE_DESK_KEY } from "@/feature/serviceDesk/shared/keys";
import {
  TicketList,
  TicketListPagination,
  useServiceDeskTicketSearchQuery,
} from "@/feature/serviceDesk/ticket/client";
import { CreateTicketDialog } from "@/feature/serviceDesk/ticketDraft/client";
import {
  normalizeTicketSearchCriteriaFormValues,
  ticketSearchCriteriaFormDefaultValues,
  type TicketSearchCriteriaFormValues,
} from "@/feature/serviceDesk/ticketSearch";
import {
  TicketSearchCriteria,
  useTicketSearchCriteriaForm,
} from "@/feature/serviceDesk/ticketSearch/client";
import { useCurrentPreference } from "@/feature/user/preference/client";
import { SupportedLanguage } from "@/lib/application/i18n";
import { NS } from "@/lib/application/i18n";
import { useLocalizedValue } from "@/lib/client/i18n";
import { useSessionStorageState } from "@/shared/client/useSessionStorageState";
import type { DbParams, ImageValueLabel } from "@/shared/types";
import { combineRuleGroups, createFieldFilter } from "@/shared/utils/routing";

const TICKET_PAGE_SIZE = 10;

const isPresent = <T,>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

type SortOrder = "asc" | "desc";
type SortOption = "ticketNumber" | "createdAt" | "dueAt" | "priority";
type ViewOption = CategoryScope;
type TicketSearchState = TicketSearchCriteriaFormValues & {
  page: number;
  order: SortOrder;
  scope: ViewOption;
  sort: SortOption;
};

type OptionItem<T> = {
  value: T;
  icon: JSX.Element;
};

const viewOption: OptionItem<ViewOption>[] = [
  // { value: "portal", icon: <Globe className="h-4 w-4" /> },
  {
    value: "INTERNAL",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    value: "PORTAL",
    icon: <ChartPie className="h-4 w-4" />,
  },
];

const sortOptions: OptionItem<SortOption>[] = [
  {
    value: "ticketNumber",
    icon: <Ticket className="h-4 w-4" />,
  },
  {
    value: "createdAt",
    icon: <CalendarDays className="h-4 w-4" />,
  },
  {
    value: "dueAt",
    icon: <CalendarCheck className="h-4 w-4" />,
  },
  {
    value: "priority",
    icon: <FlagTriangleRight className="h-4 w-4" />,
  },
];

const checkboxItemRightCheckClass =
  "gap-2 pl-2 pr-8 [&>span]:left-auto [&>span]:right-2";

const ticketSearchStateDefaultValues: TicketSearchState = {
  ...ticketSearchCriteriaFormDefaultValues,
  page: 1,
  order: "desc",
  scope: "INTERNAL",
  sort: "ticketNumber",
};

export default function ServiceDeskPage() {
  const router = useRouter();
  const { startRouteLoadingForHref } = useRouteLoading();
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);
  const { current } = useCurrentSession();
  const effectiveCompanyId = current.user?.companyId;

  const searchCriteriaState =
    useSessionStorageState<TicketSearchState>({
      key: SERVICE_DESK_KEY,
      initialValue: ticketSearchStateDefaultValues,
    });

  const form = useTicketSearchCriteriaForm();
  const restoredSearchStateRef = useRef(false);

  const [criteria, setCriteria] = useState<TicketSearchCriteriaFormValues>(
    ticketSearchCriteriaFormDefaultValues,
  );
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<SortOrder>("desc");
  const [scope, setScope] = useState<ViewOption>("INTERNAL");
  const [sort, setSort] = useState<SortOption>("ticketNumber");

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

  const categoryListParams = useMemo<DbParams | undefined>(() => {
    if (effectiveCompanyId === undefined) return undefined;

    return {
      filter: combineRuleGroups([
        createFieldFilter({
          field: "active",
          value: true,
        }),
        createFieldFilter({
          field: "tenant_company_id",
          value: effectiveCompanyId,
        }),
      ]),
    };
  }, [effectiveCompanyId]);
  const employeeListParams = useMemo<DbParams | undefined>(() => {
    if (effectiveCompanyId === undefined) return undefined;

    return {
      filter: combineRuleGroups([
        createFieldFilter({
          field: "companyId",
          value: effectiveCompanyId,
        }),
        createFieldFilter({
          field: "e_active",
          value: true,
        }),
      ]),
    };
  }, [effectiveCompanyId]);
  const { data: categoryTrees } =
    useServiceDeskCategoryListQuery(categoryListParams);
  const { data: employees } = useEmployeeListQuery(employeeListParams);

  const categories = useMemo<MainCategory[]>(() => {
    return (categoryTrees ?? [])
      .flatMap((client) => client?.categories ?? [])
      .filter(isPresent)
      .map((category) => ({
        ...category,
        subCategories: (category.subCategories ?? []).filter(isPresent),
      }));
  }, [categoryTrees]);

  const requesters = useMemo<ImageValueLabel[]>(
    () =>
      (ticketSearchResult?.facets?.requesters ?? []).map((requester) => ({
        value: requester.username,
        label: `${tLocal(requester.name).first} ${tLocal(requester.name).last}`.trim(),
        displayName: requester.username,
        image: requester.image ?? undefined,
      })),
    [ticketSearchResult?.facets?.requesters, tLocal],
  );
  const assignees = useMemo<ImageValueLabel[]>(
    () =>
      (ticketSearchResult?.facets?.assignees ?? []).map((assignee) => ({
        value: assignee.username,
        label: `${tLocal(assignee.name).first} ${tLocal(assignee.name).last}`.trim(),
        displayName: assignee.username,
        image: assignee.image ?? undefined,
      })),
    [ticketSearchResult?.facets?.assignees, tLocal],
  );

  const emails = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.email,
        label: `${name.first} ${name.last}`,
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);

  // Page overflow correction.
  useEffect(() => {
    if (ticketSearchResult?.page !== page) {
      return;
    }

    const totalPages = Math.ceil(totalCount / TICKET_PAGE_SIZE);

    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
      searchCriteriaState.setValue((prev) => ({
        ...prev,
        page: totalPages,
      }));
    }
  }, [page, searchCriteriaState, ticketSearchResult?.page, totalCount]);

  // Restore session storage.
  useEffect(() => {
    if (
      !searchCriteriaState.hydrated ||
      restoredSearchStateRef.current
    ) {
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

    const restoredCriteria = normalizeTicketSearchCriteriaFormValues(
      storedCriteria,
    );

    form.reset(restoredCriteria);
    setCriteria(restoredCriteria);
    setPage(restoredPage);
    setOrder(restoredOrder);
    setScope(restoredScope);
    setSort(restoredSort);
  }, [form, searchCriteriaState.hydrated, searchCriteriaState.value]);

  const handleSearchSubmit = async (values: TicketSearchCriteriaFormValues) => {
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

  const handleSortChange = (nextSort: SortOption) => {
    setSort(nextSort);
    setPage(1);
    searchCriteriaState.setValue((prev) => ({
      ...prev,
      sort: nextSort,
      page: 1,
    }));
  };

  const handleOrderChange = () => {
    const nextOrder = order === "desc" ? "asc" : "desc";

    setOrder(nextOrder);
    setPage(1);
    searchCriteriaState.setValue((prev) => ({
      ...prev,
      order: nextOrder,
      page: 1,
    }));
  };

  const handleScopeChange = (nextScope: ViewOption) => {
    setScope(nextScope);
    setPage(1);
    searchCriteriaState.setValue((prev) => ({
      ...prev,
      scope: nextScope,
      page: 1,
    }));
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    searchCriteriaState.setValue((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  const handleTicketSelected = (ticketId: string) => {
    const href = `/service-desk/${ticketId}`;
    startRouteLoadingForHref(href);
    router.push(href);
  };

  return (
    <main className="flex h-full min-h-0 max-w-full flex-col gap-2 overflow-x-hidden p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{t("listPage.title")}</h1>
          <p className="text-sm text-muted-foreground lg:max-w-prose">
            {t("listPage.description")}
          </p>
        </div>

        <div className="w-full lg:w-auto">
          <div className="grid w-full grid-cols-2 gap-2 lg:flex lg:w-auto lg:flex-nowrap lg:items-center lg:justify-end">
            {/* view selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="w-full min-w-0 justify-end">
                  <span className="truncate">
                    {t(`viewOption.${scope.toLowerCase()}`)}
                  </span>
                  <ChevronDown className="transition-transform" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t("viewOption.title")}</DropdownMenuLabel>
                  {viewOption.map((option) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        className={checkboxItemRightCheckClass}
                        checked={option.value === scope}
                        onClick={() => handleScopeChange(option.value)}
                      >
                        {option.icon}
                        {t(`viewOption.${option.value.toLowerCase()}`)}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* sort + order */}
            <ButtonGroup className="w-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="min-w-0 flex-1 justify-end lg:flex-none"
                  >
                    <span className="truncate">
                      {t(`sort.sort`, { ns: NS.common })}
                    </span>
                    <ChevronDown className="transition-transform" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      {t(`sort.sortBy`, { ns: NS.common })}
                    </DropdownMenuLabel>
                    {sortOptions.map((option) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={option.value}
                          className={checkboxItemRightCheckClass}
                          checked={option.value === sort}
                          onClick={() => handleSortChange(option.value)}
                        >
                          {option.icon}
                          {t(`field.${option.value}`, { ns: NS.common })}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                title={t(`sort.${order}`, { ns: NS.common })}
                variant="outline"
                className="w-10 shrink-0 px-0"
                onClick={handleOrderChange}
              >
                {order === "desc" ? (
                  <ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ArrowDownWideNarrow className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </ButtonGroup>

            {/* refresh */}
            <Button
              className="h-9 w-full min-w-[2.5rem] gap-1.5 px-2.5 lg:w-auto"
              variant="softPrimary"
              onClick={() => refetchTickets()}
            >
              <RefreshCw />
              <span className="truncate lg:hidden">
                {tCommon("action.refresh", { defaultValue: "Refresh" })}
              </span>
            </Button>

            {/* search criteria */}
            <TicketSearchCriteria
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center border-border/70 shadow-sm hover:bg-muted/40"
                >
                  {t("action.searchCriteria")}
                </Button>
              }
              form={form}
              categories={categories}
              requesters={requesters}
              assignees={assignees}
              onSubmit={handleSearchSubmit}
            />

            {/* create ticket */}
            <CreateTicketDialog
              categories={categories}
              users={emails}
              language={userPreference.language as SupportedLanguage}
              trigger={
                <Button
                  type="button"
                  className="col-span-2 w-full lg:col-span-1 lg:w-auto"
                >
                  <span className="truncate">
                    {tCommon("action.withItem", {
                      action: tCommon("action.create"),
                      item: tCommon("field.ticket"),
                    })}
                  </span>
                </Button>
              }
            />
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-w-0 max-w-full overflow-hidden rounded-md border bg-background">
        <TicketList
          tickets={tickets}
          onTicketSelected={handleTicketSelected}
          language={userPreference.language as SupportedLanguage}
          isLoading={isTicketListLoading}
        />
      </ScrollArea>

      <TicketListPagination
        page={page}
        pageSize={TICKET_PAGE_SIZE}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        className="gap-2 px-0 py-1 sm:px-1 sm:py-2"
        disabled={isTicketListLoading}
      />
    </main>
  );
}
