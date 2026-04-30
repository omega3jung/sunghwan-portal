// src/app/(protected)/service-desk/page.tsx

"use client";

import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarCheck,
  CalendarDays,
  FlagTriangleRight,
  RefreshCw,
  Ticket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SupportedLanguage } from "@/domain/config";
import type { MainCategory } from "@/domain/serviceDesk";
import { useCurrentSession } from "@/feature/auth/session/hooks/useCurrentSession";
import { useEmployeeListQuery } from "@/feature/organization/employee";
import { useServiceDeskCategoryListQuery } from "@/feature/serviceDesk/category";
import { SERVICE_DESK_KEY } from "@/feature/serviceDesk/shared/keys";
import {
  CreateTicketDialog,
  TicketList,
  useServiceDeskTicketSearchQuery,
} from "@/feature/serviceDesk/ticket";
import { TicketListPagination } from "@/feature/serviceDesk/ticket/components/TicketList/TicketListPagination";
import {
  TicketSearchCriteria,
  ticketSearchCriteriaFormDefaultValues,
  type TicketSearchCriteriaFormValues,
  useTicketSearchCriteriaForm,
} from "@/feature/serviceDesk/ticketSearch";
import { useCurrentPreference } from "@/feature/user/preference/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useLocalizedValue } from "@/shared/hooks";
import { useSessionStorageState } from "@/shared/hooks/useSessionStorageState";
import type { ImageValueLabel } from "@/shared/types";

const TICKET_PAGE_SIZE = 10;

const isPresent = <T,>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

type SortOrder = "asc" | "desc";
type SortOption = "ticketNumber" | "createdAt" | "dueAt" | "priority";

type SortOptionItem = {
  value: SortOption;
  icon: JSX.Element;
};

const sortOptions: SortOptionItem[] = [
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

export default function ServiceDeskPage() {
  const router = useRouter();
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);
  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);
  const { data: currentSession } = useCurrentSession();

  const searchCriteriaState =
    useSessionStorageState<TicketSearchCriteriaFormValues>({
      key: SERVICE_DESK_KEY,
      initialValue: ticketSearchCriteriaFormDefaultValues,
    });

  const form = useTicketSearchCriteriaForm();

  const [criteria, setCriteria] = useState<TicketSearchCriteriaFormValues>(
    ticketSearchCriteriaFormDefaultValues,
  );
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<SortOrder>("desc");
  const [sort, setSort] = useState<SortOption>("ticketNumber");

  const {
    data: ticketSearchResult,
    isLoading: isTicketListLoading,
    refetch: refetchTickets,
  } = useServiceDeskTicketSearchQuery({
    criteria,
    sort,
    order,
    page,
    pageSize: TICKET_PAGE_SIZE,
    enabled: searchCriteriaState.hydrated,
  });

  const tickets = ticketSearchResult?.items ?? [];
  const totalCount = ticketSearchResult?.totalCount ?? 0;

  const { data: categoryTrees } = useServiceDeskCategoryListQuery({
    filter: {
      rules: [
        {
          field: "id",
          operator: "=",
          value: currentSession?.user.companyId,
        },
      ],
    },
  });
  const { data: employees } = useEmployeeListQuery({});

  const categories = useMemo<MainCategory[]>(() => {
    return (categoryTrees ?? [])
      .flatMap((client) => client?.categories ?? [])
      .filter(isPresent)
      .map((category) => ({
        ...category,
        subCategories: (category.subCategories ?? []).filter(isPresent),
      }));
  }, [categoryTrees]);

  const users = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.userName,
        label: `${name.first} ${name.last}`,
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);

  // Page overflow correction.
  useEffect(() => {
    const totalPages = Math.ceil(totalCount / TICKET_PAGE_SIZE);

    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalCount]);

  // Restore session storage.
  useEffect(() => {
    if (!searchCriteriaState.hydrated) {
      return;
    }

    form.reset(searchCriteriaState.value);
    setCriteria(searchCriteriaState.value);
    setPage(1);
  }, [form, searchCriteriaState.hydrated, searchCriteriaState.value]);

  const handleSearchSubmit = async (values: TicketSearchCriteriaFormValues) => {
    searchCriteriaState.setValue(values);
    setCriteria(values);
    setPage(1);
  };

  const handleSortChange = (nextSort: SortOption) => {
    setSort(nextSort);
    setPage(1);
  };

  const handleOrderChange = () => {
    setOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  const handleTicketSelected = (ticketId: string) => {
    router.push(`/service-desk/${ticketId}`);
  };

  return (
    <main className="flex h-full min-h-0 flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("listPage.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("listPage.description")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ButtonGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {t(`sort.sort`, { ns: NS.common })}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40" align="start">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    {t(`sort.sortBy`, { ns: NS.common })}
                  </DropdownMenuLabel>
                  {sortOptions.map((option) => {
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => handleSortChange(option.value)}
                      >
                        {option.icon}
                        {t(`field.${option.value}`, { ns: NS.common })}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              title={t(`sort.${order}`, { ns: NS.common })}
              variant="outline"
              onClick={handleOrderChange}
            >
              {order === "desc" ? (
                <ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ArrowDownWideNarrow className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </ButtonGroup>
          <Button
            className="p-2.5"
            variant="softPrimary"
            onClick={() => refetchTickets()}
          >
            <RefreshCw />
          </Button>
          <TicketSearchCriteria
            form={form}
            categories={categories}
            users={users}
            onSubmit={handleSearchSubmit}
          />

          <CreateTicketDialog
            categories={categories}
            users={users}
            language={userPreference.language as SupportedLanguage}
            trigger={
              <Button type="button">
                {tCommon("action.withItem", {
                  action: tCommon("action.create"),
                  item: tCommon("field.ticket"),
                })}
              </Button>
            }
          />
        </div>
      </div>

      <ScrollArea className="flex-1 rounded-md border bg-background">
        <TicketList
          tickets={tickets}
          onTicketSelected={handleTicketSelected}
          users={users}
          language={userPreference.language as SupportedLanguage}
          isLoading={isTicketListLoading}
        />
      </ScrollArea>

      <TicketListPagination
        page={page}
        pageSize={TICKET_PAGE_SIZE}
        totalCount={totalCount}
        onPageChange={setPage}
        disabled={isTicketListLoading}
      />
    </main>
  );
}
