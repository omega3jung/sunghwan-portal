import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { TicketSummary, TicketUser } from "@/domain/serviceDesk";
import { getStatusOptions } from "@/feature/serviceDesk/shared";
import {
  buildAssigneeSummary,
  buildCategorySummary,
  buildDepartmentSummary,
  buildSlaSummary,
  buildStatusSummary,
  buildTenantSummary,
  type ChartFilter,
  type SlaBucketValue,
} from "@/feature/serviceDesk/ticket/client";
import { NS } from "@/lib/application/i18n";
import { useLocalizedValue } from "@/lib/client/i18n";
import type { ImageValueLabel, Locale } from "@/shared/types";

import { getChartFilterFieldLabel, isTicketMatchedByChartFilter } from "../util";

type UseInsightsViewModelParams = {
  tickets: TicketSummary[];
  assignees: TicketUser[] | undefined;
  language: Locale;
  chartFilter: ChartFilter;
  isLoading: boolean;
};

export function useInsightsViewModel({
  tickets,
  assignees,
  language,
  chartFilter,
  isLoading,
}: UseInsightsViewModelParams) {
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tStatus } = useTranslation(NS.serviceDesk, {
    keyPrefix: "ticketStatus",
  });
  const { t: tCommon } = useTranslation(NS.common);
  const tLocal = useLocalizedValue(language);

  const statusLabelMap = useMemo(() => {
    const statusOptions = getStatusOptions(tStatus);
    return new Map(statusOptions.map((option) => [option.value, option.label]));
  }, [tStatus]);

  const usersById = useMemo(() => {
    return new Map(
      (assignees ?? []).map((assignee) => {
        const name = tLocal(assignee.name);
        const option: ImageValueLabel = {
          value: assignee.username,
          label: `${name.first} ${name.last}`.trim(),
          displayName: assignee.username,
          image: assignee.image ?? undefined,
        };

        return [assignee.username, option];
      }),
    );
  }, [assignees, tLocal]);

  const fallbackDepartmentLabel = t("insights.unknownDepartment", {
    defaultValue: "Unknown department",
  });
  const fallbackTenantLabel = t("insights.unknownTenant", {
    defaultValue: "Unknown tenant",
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

  const statusChartData = useMemo(() => {
    return buildStatusSummary(tickets, statusLabelMap);
  }, [tickets, statusLabelMap]);

  const categoryChartData = useMemo(() => {
    return buildCategorySummary(tickets, getCategoryLabel);
  }, [tickets, getCategoryLabel]);

  const departmentChartData = useMemo(() => {
    return buildDepartmentSummary(tickets, tLocal, fallbackDepartmentLabel);
  }, [tickets, tLocal, fallbackDepartmentLabel]);

  const tenantChartData = useMemo(() => {
    return buildTenantSummary(tickets, tLocal, fallbackTenantLabel);
  }, [tickets, tLocal, fallbackTenantLabel]);

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
        fallbackDepartmentLabel,
        fallbackTenantLabel,
      }),
    );
  }, [
    tickets,
    chartFilter,
    getCategoryLabel,
    fallbackDepartmentLabel,
    fallbackTenantLabel,
  ]);

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
  const filterFieldLabel = chartFilter
    ? getChartFilterFieldLabel(chartFilter.type, {
        status: tCommon("field.status"),
        category: tCommon("field.category"),
        department: tCommon("field.department"),
        tenant: t("chart.tenant.label", { defaultValue: "Tenant" }),
        assignee: tCommon("field.assignee"),
        sla: "SLA",
      })
    : null;
  const showFilteredEmpty =
    Boolean(chartFilter) && !isLoading && filteredTicketCount === 0;

  return {
    chartData: {
      status: statusChartData,
      category: categoryChartData,
      department: departmentChartData,
      tenant: tenantChartData,
      assignee: assigneeChartData,
      sla: slaChartData,
    },
    filteredTickets,
    totalTicketCount,
    filteredTicketCount,
    chartBaseDescription,
    ticketCountDescription,
    filterFieldLabel,
    showFilteredEmpty,
  };
}
