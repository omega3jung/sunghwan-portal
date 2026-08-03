"use client";

import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Building2,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  FlagTriangleRight,
  Funnel,
  Globe,
  Plus,
  RefreshCw,
  Ticket,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
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
import {
  TicketList,
  TicketListPagination,
} from "@/feature/serviceDesk/ticket/client";
import { CreateTicketDialog } from "@/feature/serviceDesk/ticketDraft/client";
import { TicketSearchCriteria } from "@/feature/serviceDesk/ticketSearch/client";
import { NS } from "@/lib/application/i18n";

import {
  type ServiceDeskSortOption,
  type ServiceDeskViewOption,
  useServiceDeskSearchState,
} from "../hooks/useServiceDeskSearchState";
import { useServiceDeskViewModel } from "../hooks/useServiceDeskViewModel";

type OptionItem<T> = {
  value: T;
  icon: ReactElement;
};

const viewOption: OptionItem<ServiceDeskViewOption>[] = [
  {
    value: "INTERNAL",
    icon: <Building2 className="h-4 w-4" />,
  },
  {
    value: "PORTAL",
    icon: <Globe className="h-4 w-4" />,
  },
];

const sortOptions: OptionItem<ServiceDeskSortOption>[] = [
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

export function ServiceDeskPage() {
  const router = useRouter();
  const { startRouteLoadingForHref } = useRouteLoading();
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);
  const {
    form,
    tickets,
    ticketSearchResult,
    totalCount,
    isTicketListLoading,
    page,
    pageSize,
    order,
    scope,
    sort,
    submitSearch,
    changeSort,
    toggleOrder,
    changeScope,
    changePage,
    refetchTickets,
  } = useServiceDeskSearchState();
  const {
    language,
    categories,
    requesterOptions,
    assigneeOptions,
    recipientOptions,
  } = useServiceDeskViewModel({ ticketSearchResult });

  const handleTicketSelected = (ticketId: string) => {
    const href = `/service-desk/${ticketId}`;
    startRouteLoadingForHref(href);
    router.push(href);
  };

  return (
    <main className="flex h-full min-h-0 max-w-full flex-col gap-5 overflow-x-hidden p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{t("listPage.title")}</h1>
          <p className="text-sm text-muted-foreground lg:max-w-prose">
            {t("listPage.description")}
          </p>
        </div>

        <div className="w-full lg:w-auto">
          <div className="grid w-full grid-cols-2 gap-3 lg:flex lg:w-auto lg:flex-nowrap lg:items-center lg:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button className="min-w-0 justify-end" />}
              >
                <span className="truncate">
                  {t(`viewOption.${scope.toLowerCase()}`)}
                </span>
                <ChevronDown className="transition-transform" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-40">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t("viewOption.title")}</DropdownMenuLabel>
                  {viewOption.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      className="gap-2 pl-2 pr-8 [&>span]:left-auto [&>span]:right-2"
                      checked={option.value === scope}
                      onClick={() => changeScope(option.value)}
                    >
                      {option.icon}
                      {t(`viewOption.${option.value.toLowerCase()}`)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <ButtonGroup className="w-full">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="min-w-0 flex-1 justify-end lg:flex-none"
                    />
                  }
                >
                  <span className="truncate">
                    {t("sort.sort", { ns: NS.common })}
                  </span>
                  <ChevronDown className="transition-transform" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      {t("sort.sortBy", { ns: NS.common })}
                    </DropdownMenuLabel>
                    {sortOptions.map((option) => (
                      <DropdownMenuCheckboxItem
                        key={option.value}
                        className="gap-2 pl-2 pr-8 [&>span]:left-auto [&>span]:right-2"
                        checked={option.value === sort}
                        onClick={() => changeSort(option.value)}
                      >
                        {option.icon}
                        {t(`field.${option.value}`, { ns: NS.common })}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                title={t(`sort.${order}`, { ns: NS.common })}
                variant="outline"
                className="w-10 px-0"
                onClick={toggleOrder}
              >
                {order === "desc" ? (
                  <ArrowUpNarrowWide className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ArrowDownWideNarrow className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </ButtonGroup>

            <Button
              className="w-full p-2 lg:w-auto"
              variant="default"
              onClick={() => refetchTickets()}
            >
              <RefreshCw />
              <span className="truncate lg:hidden">
                {tCommon("action.refresh", { defaultValue: "Refresh" })}
              </span>
            </Button>

            <TicketSearchCriteria
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  className="border-border/70 shadow-sm hover:bg-muted/40"
                >
                  <Funnel />
                  {t("action.searchCriteria")}
                </Button>
              }
              form={form}
              categories={categories}
              requesters={requesterOptions}
              assignees={assigneeOptions}
              onSubmit={submitSearch}
            />

            <CreateTicketDialog
              categories={categories}
              users={recipientOptions}
              language={language}
              trigger={
                <Button
                  type="button"
                  className="col-span-2 w-full lg:col-span-1 lg:w-auto"
                >
                  <Plus />
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
          language={language}
          isLoading={isTicketListLoading}
        />
      </ScrollArea>

      <TicketListPagination
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={changePage}
        className="gap-2 px-0 py-1 sm:px-1 sm:pt-2 sm:pb-1"
        disabled={isTicketListLoading}
      />
    </main>
  );
}
