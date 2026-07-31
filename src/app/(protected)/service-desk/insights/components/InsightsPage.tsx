"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useRouteLoading } from "@/components/layout/RouteLoading";
import { isOwnerCompany } from "@/domain/organization";
import { useCurrentSession } from "@/feature/auth/session/client";
import {
  type ChartFilter,
  type ChartSummaryItem,
  useServiceDeskTicketSearchQuery,
} from "@/feature/serviceDesk/ticket/client";
import { useCurrentPreference } from "@/feature/user/preference/client";
import type { SupportedLanguage } from "@/lib/application/i18n";

import {
  INSIGHTS_ORDER,
  INSIGHTS_PAGE,
  INSIGHTS_PAGE_SIZE,
  INSIGHTS_SORT,
} from "../constants";
import { useInsightsSearchState } from "../hooks/useInsightsSearchState";
import { useInsightsViewModel } from "../hooks/useInsightsViewModel";
import type { ChartViewMode } from "../types";
import { InsightsActiveFilter } from "./InsightsActiveFilter";
import { InsightsChartGrid } from "./InsightsChartGrid";
import { InsightsTicketResults } from "./InsightsTicketResults";
import { InsightsToolbar } from "./InsightsToolbar";

export function InsightsPage() {
  const router = useRouter();
  const { startRouteLoadingForHref } = useRouteLoading();
  const { current } = useCurrentSession();
  const { current: userPreference } = useCurrentPreference();
  const {
    hydrated,
    criteria,
    scope,
    currentPeriodType,
    pickerRange,
    handleScopeChange,
    handlePeriodChange,
    handleRangeChange,
  } = useInsightsSearchState();
  const [chartFilter, setChartFilter] = useState<ChartFilter>(null);
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>("full");
  const showTenantChart =
    scope === "PORTAL" && isOwnerCompany(current.user?.companyId);

  const {
    data: ticketSearchResult,
    isLoading: isTicketListLoading,
    refetch: refetchTickets,
  } = useServiceDeskTicketSearchQuery({
    criteria: {
      ...criteria,
      cat_scope: scope,
    },
    sort: INSIGHTS_SORT,
    order: INSIGHTS_ORDER,
    page: INSIGHTS_PAGE,
    pageSize: INSIGHTS_PAGE_SIZE,
    enabled: hydrated,
  });

  const ticketItems = ticketSearchResult?.items;
  const tickets = useMemo(() => ticketItems ?? [], [ticketItems]);
  const {
    chartData,
    filteredTickets,
    chartBaseDescription,
    ticketCountDescription,
    filterFieldLabel,
    showFilteredEmpty,
  } = useInsightsViewModel({
    tickets,
    assignees: ticketSearchResult?.facets?.assignees,
    language: userPreference.language,
    chartFilter,
    isLoading: isTicketListLoading,
  });

  useEffect(() => {
    if (showTenantChart) {
      return;
    }

    setChartFilter((previous) =>
      previous?.type === "tenant" ? null : previous,
    );
  }, [showTenantChart]);

  const handleTicketSelected = (ticketId: string) => {
    const href = `/service-desk/${ticketId}`;
    startRouteLoadingForHref(href);
    router.push(href);
  };

  const handleChartSelect = (
    type: NonNullable<ChartFilter>["type"],
    item: ChartSummaryItem,
  ) => {
    setChartFilter((previous) => {
      if (previous?.type === type && previous.value === item.value) {
        return null;
      }

      return {
        type,
        value: item.value,
        label: item.label,
      };
    });
  };

  const clearChartFilter = () => setChartFilter(null);

  return (
    <main className="flex h-full min-h-0 flex-col gap-3 overflow-x-hidden p-3 sm:p-4">
      <InsightsToolbar
        scope={scope}
        currentPeriodType={currentPeriodType}
        pickerRange={pickerRange}
        chartViewMode={chartViewMode}
        onScopeChange={handleScopeChange}
        onPeriodChange={handlePeriodChange}
        onRangeChange={handleRangeChange}
        onChartViewModeChange={setChartViewMode}
        onRefresh={() => refetchTickets()}
      />
      <InsightsChartGrid
        chartViewMode={chartViewMode}
        chartData={chartData}
        isLoading={isTicketListLoading}
        chartFilter={chartFilter}
        showTenantChart={showTenantChart}
        chartBaseDescription={chartBaseDescription}
        onChartSelect={handleChartSelect}
      />
      <InsightsActiveFilter
        chartFilter={chartFilter}
        filterFieldLabel={filterFieldLabel}
        ticketCountDescription={ticketCountDescription}
        onClearFilter={clearChartFilter}
      />
      <InsightsTicketResults
        tickets={filteredTickets}
        isLoading={isTicketListLoading}
        language={userPreference.language as SupportedLanguage}
        showFilteredEmpty={showFilteredEmpty}
        onTicketSelected={handleTicketSelected}
        onClearFilter={clearChartFilter}
      />
    </main>
  );
}
