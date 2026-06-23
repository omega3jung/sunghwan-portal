"use client";

import {
  BarChart3,
  ChevronDown,
  EyeOff,
  LayoutGrid,
  RefreshCw,
  Rows3,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

import { DateRangePicker } from "@/components/custom/DatePicker";
import { getStatusOptions } from "@/components/custom/StatusBadge/options";
import { useRouteLoading } from "@/components/layout/RouteLoading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SupportedLanguage } from "@/domain/config";
import type { TicketSummary } from "@/domain/serviceDesk";
import { useDepartmentListQuery } from "@/feature/organization/department/client";
import { useEmployeeListQuery } from "@/feature/organization/employee/client";
import { SERVICE_DESK_KEY } from "@/feature/serviceDesk/shared/keys";
import { useServiceDeskTicketSearchQuery } from "@/feature/serviceDesk/ticket/api/client";
import { TicketList } from "@/feature/serviceDesk/ticket/components";
import {
  AssigneeChart,
  buildAssigneeSummary,
  buildCategorySummary,
  buildDepartmentSummary,
  buildSlaSummary,
  buildStatusSummary,
  CategoryChart,
  ChartFilter,
  type ChartSummaryItem,
  DepartmentChart,
  getSlaBucket,
  isUnassignedAssigneeValue,
  SlaBucketValue,
  SlaChart,
  TicketChart,
} from "@/feature/serviceDesk/ticket/components/chart";
import {
  ticketSearchCriteriaFormDefaultValues,
  type TicketSearchCriteriaFormValues,
} from "@/feature/serviceDesk/ticketSearch";
import { TICKET_PERIOD_OPTIONS } from "@/feature/serviceDesk/ticketSearch/components/options";
import { useCurrentPreference } from "@/feature/user/preference/hooks/useCurrentPreference";
import { NS } from "@/lib/i18n";
import { useSessionStorageState } from "@/shared/client/useSessionStorageState";
import { useLocalizedValue } from "@/shared/hooks";
import type { DateRangePreset } from "@/shared/types";
import type { ImageValueLabel } from "@/shared/types";

const INSIGHTS_PAGE = 1;
const INSIGHTS_PAGE_SIZE = 500;
const INSIGHTS_SORT = "ticketNumber";
const INSIGHTS_ORDER = "desc";
const DEFAULT_INSIGHTS_PERIOD: DateRangePreset = "last_3month";

type ChartViewMode = "full" | "compact" | "hidden";
type CriteriaPeriodRange =
  TicketSearchCriteriaFormValues["period"]["dateRange"];

type OptionItem<T> = {
  value: T;
  icon: JSX.Element;
};

const chartViewOption: OptionItem<ChartViewMode>[] = [
  {
    value: "full",
    icon: <LayoutGrid className="h-4 w-4" />,
  },
  {
    value: "compact",
    icon: <Rows3 className="h-4 w-4" />,
  },
  {
    value: "hidden",
    icon: <EyeOff className="h-4 w-4" />,
  },
];

const checkboxItemRightCheckClass =
  "gap-2 pl-2 pr-8 [&>span]:left-auto [&>span]:right-2";

const isDateRangePreset = (value: string): value is DateRangePreset => {
  return TICKET_PERIOD_OPTIONS.includes(value as DateRangePreset);
};

const toCompleteCriteriaPeriodRange = (
  selected: DateRange | undefined,
): CriteriaPeriodRange | null => {
  if (!selected?.from || !selected.to) {
    return null;
  }

  return {
    from: selected.from,
    to: selected.to,
  };
};

const getChartFilterFieldLabel = (
  filterType: NonNullable<ChartFilter>["type"],
  labels: {
    status: string;
    category: string;
    department: string;
    assignee: string;
    sla: string;
  },
) => {
  switch (filterType) {
    case "status":
      return labels.status;
    case "category":
      return labels.category;
    case "department":
      return labels.department;
    case "assignee":
      return labels.assignee;
    case "sla":
      return labels.sla;
    default:
      return filterType;
  }
};

const isTicketMatchedByChartFilter = ({
  ticket,
  filter,
  getCategoryLabel,
  requesterByUserName,
  departmentsById,
  fallbackDepartmentLabel,
}: {
  ticket: TicketSummary;
  filter: NonNullable<ChartFilter>;
  getCategoryLabel: (ticket: TicketSummary) => string;
  requesterByUserName: Map<string, { departmentId: string }>;
  departmentsById: Map<string, unknown>;
  fallbackDepartmentLabel: string;
}): boolean => {
  switch (filter.type) {
    case "status":
      return ticket.status === filter.value;
    case "category":
      return getCategoryLabel(ticket) === filter.value;
    case "department": {
      const requester = requesterByUserName.get(ticket.requesterUsername);
      const departmentId = requester?.departmentId;
      const hasDepartment = departmentId
        ? departmentsById.has(departmentId)
        : false;

      return (
        (hasDepartment ? departmentId : fallbackDepartmentLabel) ===
        filter.value
      );
    }
    case "assignee":
      if (isUnassignedAssigneeValue(filter.value)) {
        return ticket.assigneeUsernames.length === 0;
      }
      return ticket.assigneeUsernames.includes(filter.value);
    case "sla":
      return getSlaBucket(ticket.dueAt) === filter.value;
    default:
      return true;
  }
};

export default function ServiceDeskInsightsPage() {
  const router = useRouter();
  const { startRouteLoadingForHref } = useRouteLoading();
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);

  const { current: userPreference } = useCurrentPreference();
  const tLocal = useLocalizedValue(userPreference.language);

  const searchCriteriaState =
    useSessionStorageState<TicketSearchCriteriaFormValues>({
      key: `${SERVICE_DESK_KEY}.insights`,
      initialValue: ticketSearchCriteriaFormDefaultValues,
    });

  const [criteria, setCriteria] = useState<TicketSearchCriteriaFormValues>(
    ticketSearchCriteriaFormDefaultValues,
  );
  const [chartFilter, setChartFilter] = useState<ChartFilter>(null);
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>("full");
  const [pickerRange, setPickerRange] = useState<DateRange | undefined>(
    ticketSearchCriteriaFormDefaultValues.period.dateRange,
  );
  const currentPeriodType = isDateRangePreset(criteria.period.type)
    ? criteria.period.type
    : DEFAULT_INSIGHTS_PERIOD;
  const nextPeriodTypeRef = useRef<DateRangePreset>(currentPeriodType);

  const {
    data: ticketSearchResult,
    isLoading: isTicketListLoading,
    refetch: refetchTickets,
  } = useServiceDeskTicketSearchQuery({
    criteria,
    sort: INSIGHTS_SORT,
    order: INSIGHTS_ORDER,
    page: INSIGHTS_PAGE,
    pageSize: INSIGHTS_PAGE_SIZE,
    enabled: searchCriteriaState.hydrated,
  });

  const ticketItems = ticketSearchResult?.items;
  const tickets = useMemo(() => ticketItems ?? [], [ticketItems]);

  const { data: employees } = useEmployeeListQuery({});
  const { data: departments } = useDepartmentListQuery({});

  const users = useMemo<ImageValueLabel[]>(() => {
    if (!employees) {
      return [];
    }

    return employees.map((employee) => {
      const name = tLocal(employee.name);

      return {
        value: employee.username,
        label: `${name.first} ${name.last}`,
        displayName: employee.email,
        image: employee.imageUrl,
      };
    });
  }, [employees, tLocal]);

  const statusLabelMap = useMemo(() => {
    const statusOptions = getStatusOptions(userPreference.language);
    return new Map(statusOptions.map((option) => [option.value, option.label]));
  }, [userPreference.language]);

  const usersById = useMemo(() => {
    return new Map(users.map((user) => [user.value, user]));
  }, [users]);

  const requesterByUserName = useMemo(() => {
    return new Map(
      (employees ?? []).map((employee) => [employee.username, employee]),
    );
  }, [employees]);

  const departmentsById = useMemo(() => {
    return new Map(
      (departments ?? []).map((department) => [department.id, department]),
    );
  }, [departments]);

  const fallbackDepartmentLabel = t("insights.unknownDepartment", {
    defaultValue: "Unknown department",
  });
  const unassignedAssigneeLabel = t("detailAside.unassigned", {
    defaultValue: "Unassigned",
  });

  const getCategoryLabel = useCallback(
    (ticket: TicketSummary) => {
      return tLocal(ticket.categoryName);
    },
    [tLocal],
  );

  const ticketChartData = useMemo(() => {
    return buildStatusSummary(tickets, statusLabelMap);
  }, [tickets, statusLabelMap]);

  const categoryChartData = useMemo(() => {
    return buildCategorySummary(tickets, getCategoryLabel);
  }, [tickets, getCategoryLabel]);

  const departmentChartData = useMemo(() => {
    return buildDepartmentSummary(
      tickets,
      requesterByUserName,
      departmentsById,
      (department) => tLocal(department.name),
      fallbackDepartmentLabel,
    );
  }, [
    tickets,
    requesterByUserName,
    departmentsById,
    tLocal,
    fallbackDepartmentLabel,
  ]);

  const assigneeChartData = useMemo(() => {
    return buildAssigneeSummary(tickets, usersById, unassignedAssigneeLabel);
  }, [tickets, usersById, unassignedAssigneeLabel]);

  const slaLabels = useMemo<Record<SlaBucketValue, string>>(
    () => ({
      overdue: t("insights.sla.overdue", { defaultValue: "Overdue" }),
      dueToday: t("insights.sla.dueToday", { defaultValue: "Due today" }),
      dueThisWeek: t("insights.sla.dueThisWeek", {
        defaultValue: "Due this week",
      }),
      later: t("insights.sla.later", { defaultValue: "Later" }),
    }),
    [t],
  );

  const slaChartData = useMemo(() => {
    return buildSlaSummary(tickets, slaLabels);
  }, [tickets, slaLabels]);

  const filteredTickets = useMemo(() => {
    if (!chartFilter) {
      return tickets;
    }

    return tickets.filter((ticket) =>
      isTicketMatchedByChartFilter({
        ticket,
        filter: chartFilter,
        getCategoryLabel,
        requesterByUserName,
        departmentsById,
        fallbackDepartmentLabel,
      }),
    );
  }, [
    tickets,
    chartFilter,
    getCategoryLabel,
    requesterByUserName,
    departmentsById,
    fallbackDepartmentLabel,
  ]);

  useEffect(() => {
    if (!searchCriteriaState.hydrated) {
      return;
    }

    setCriteria(searchCriteriaState.value);
    setPickerRange(searchCriteriaState.value.period.dateRange);
  }, [searchCriteriaState.hydrated, searchCriteriaState.value]);

  useEffect(() => {
    nextPeriodTypeRef.current = currentPeriodType;
  }, [currentPeriodType]);

  useEffect(() => {
    if (currentPeriodType !== "range") {
      setPickerRange(criteria.period.dateRange);
    }
  }, [criteria.period.dateRange, currentPeriodType]);

  const handleTicketSelected = (ticketId: string) => {
    const href = `/service-desk/${ticketId}`;
    startRouteLoadingForHref(href);
    router.push(href);
  };

  const updateCriteriaPeriod = (next: {
    type: DateRangePreset;
    dateRange: CriteriaPeriodRange;
  }) => {
    setCriteria((prev) => {
      const nextCriteria = {
        ...prev,
        period: {
          type: next.type,
          dateRange: next.dateRange,
        },
      };

      searchCriteriaState.setValue(nextCriteria);
      return nextCriteria;
    });
  };

  const handleChartSelect =
    (type: NonNullable<ChartFilter>["type"]) => (item: ChartSummaryItem) => {
      setChartFilter((prev) => {
        if (prev?.type === type && prev.value === item.value) {
          return null;
        }

        return {
          type,
          value: item.value,
          label: item.label,
        };
      });
    };

  const filterFieldLabel = chartFilter
    ? getChartFilterFieldLabel(chartFilter.type, {
        status: tCommon("field.status"),
        category: tCommon("field.category"),
        department: tCommon("field.department"),
        assignee: tCommon("field.assignee"),
        sla: "SLA",
      })
    : null;

  const showFilteredEmpty =
    Boolean(chartFilter) &&
    !isTicketListLoading &&
    filteredTickets.length === 0;
  const isChartHidden = chartViewMode === "hidden";
  const chartCardMode = chartViewMode === "compact" ? "compact" : "full";
  const chartGridClassName =
    chartViewMode === "compact"
      ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3";
  const totalTicketCount = tickets.length;
  const filteredTicketCount = filteredTickets.length;
  const chartBaseDescription = t("insights.currentInsightSummary", {
    count: totalTicketCount,
    defaultValue:
      "Charts are based on {{count}} tickets in the current insight range.",
  });
  const ticketCountDescription = chartFilter
    ? t("insights.filteredTicketCountSummary", {
        filteredCount: filteredTicketCount,
        totalCount: totalTicketCount,
        defaultValue: "Filtered tickets: {{filteredCount}} / {{totalCount}}",
      })
    : t("insights.totalTicketCountSummary", {
        count: totalTicketCount,
        defaultValue: "Total tickets: {{count}}",
      });

  return (
    <main className="flex h-full min-h-0 flex-col gap-3 overflow-x-hidden p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">{t("insights.title")}</h1>
          <p className="text-sm text-muted-foreground sm:max-w-prose">
            {t("insights.description")}
          </p>
        </div>

        <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto sm:items-center sm:justify-end">
          <Button
            className="h-9.5 shrink-0 px-2.5"
            variant="softPrimary"
            onClick={() => refetchTickets()}
          >
            <RefreshCw />
          </Button>

          <DateRangePicker
            className="h-9.5 w-full min-w-0 sm:w-72"
            period={currentPeriodType}
            onPeriodChange={(selected) => {
              const nextType = selected ?? currentPeriodType;

              nextPeriodTypeRef.current = nextType;
              updateCriteriaPeriod({
                type: nextType,
                dateRange: criteria.period.dateRange,
              });
            }}
            range={pickerRange}
            onRangeChange={(selected) => {
              setPickerRange(selected);

              const completeRange = toCompleteCriteriaPeriodRange(selected);
              if (!completeRange) {
                return;
              }

              updateCriteriaPeriod({
                type: nextPeriodTypeRef.current,
                dateRange: completeRange,
              });
            }}
            showTextType="all"
            options={TICKET_PERIOD_OPTIONS}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full min-w-0 justify-between border-border sm:w-auto sm:justify-center"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="truncate">
                  {t("insights.chartView.label")}:{" "}
                  {t(`insights.chartView.${chartViewMode}`)}
                </span>
                <ChevronDown className="transition-transform" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {t("insights.chartView.label")}
                </DropdownMenuLabel>
                {chartViewOption.map((option) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      className={checkboxItemRightCheckClass}
                      checked={option.value === chartViewMode}
                      onClick={() => setChartViewMode(option.value)}
                    >
                      {option.icon}
                      {t(`insights.chartView.${option.value}`)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <section className="z-20 rounded-md bg-background/95 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:sticky md:top-0 md:pb-3">
        <div className="flex flex-wrap items-start justify-between gap-1.5 text-xs text-muted-foreground sm:gap-2">
          <span className="min-w-0 break-words">{chartBaseDescription}</span>
          <span className="min-w-0 break-words">
            {t("insights.chartSummaryDescription")}
          </span>
        </div>

        {!isChartHidden ? (
          <section className={`mt-2 sm:mt-3 ${chartGridClassName}`}>
            <TicketChart
              title={t("insights.chart.statusTitle")}
              data={ticketChartData}
              isLoading={isTicketListLoading}
              mode={chartCardMode}
              activeValue={
                chartFilter?.type === "status" ? chartFilter.value : undefined
              }
              onSelect={handleChartSelect("status")}
              emptyMessage={tCommon("empty.noResults")}
            />
            <CategoryChart
              title={t("chart.category.title")}
              data={categoryChartData}
              isLoading={isTicketListLoading}
              mode={chartCardMode}
              activeValue={
                chartFilter?.type === "category" ? chartFilter.value : undefined
              }
              onSelect={handleChartSelect("category")}
              emptyMessage={tCommon("empty.noResults")}
            />
            <DepartmentChart
              title={t("chart.department.title")}
              data={departmentChartData}
              isLoading={isTicketListLoading}
              mode={chartCardMode}
              activeValue={
                chartFilter?.type === "department"
                  ? chartFilter.value
                  : undefined
              }
              onSelect={handleChartSelect("department")}
              emptyMessage={tCommon("empty.noResults")}
            />
            <AssigneeChart
              title={t("chart.assignee.title")}
              data={assigneeChartData}
              isLoading={isTicketListLoading}
              mode={chartCardMode}
              activeValue={
                chartFilter?.type === "assignee" ? chartFilter.value : undefined
              }
              onSelect={handleChartSelect("assignee")}
              emptyMessage={tCommon("empty.noResults")}
            />
            <SlaChart
              title={t("chart.sla.title")}
              data={slaChartData}
              isLoading={isTicketListLoading}
              mode={chartCardMode}
              activeValue={
                chartFilter?.type === "sla" ? chartFilter.value : undefined
              }
              onSelect={handleChartSelect("sla")}
              emptyMessage={tCommon("empty.noResults")}
            />
          </section>
        ) : null}
      </section>

      {chartFilter ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-background px-3 py-2">
          <div className="w-full px-0 text-sm text-muted-foreground sm:w-auto sm:px-2">
            {ticketCountDescription}
          </div>
          <Separator
            orientation="vertical"
            className="mx-1 hidden h-4 sm:mx-2 sm:block"
          />
          <span className="text-sm text-muted-foreground">
            {t("insights.activeFilter")}
          </span>
          <Badge
            variant="secondary"
            className="max-w-full gap-1 rounded-full pr-1"
          >
            <span className="max-w-[220px] truncate sm:max-w-none">
              {filterFieldLabel}: {chartFilter.label}
            </span>
            <button
              type="button"
              onClick={() => setChartFilter(null)}
              className="rounded-full p-0.5 hover:bg-background/60"
              aria-label={t("insights.clearFilter")}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => setChartFilter(null)}
          >
            {t("insights.clearAll")}
          </Button>
        </div>
      ) : null}

      <ScrollArea className="flex-1 overflow-hidden rounded-md border bg-background">
        {showFilteredEmpty ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 px-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("insights.emptyFilteredTickets")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChartFilter(null)}
            >
              {t("insights.clearFilter")}
            </Button>
          </div>
        ) : (
          <TicketList
            tickets={filteredTickets}
            onTicketSelected={handleTicketSelected}
            users={users}
            language={userPreference.language as SupportedLanguage}
            isLoading={isTicketListLoading}
          />
        )}
      </ScrollArea>
    </main>
  );
}
