import { useTranslation } from "react-i18next";

import {
  AssigneeChart,
  CategoryChart,
  type ChartFilter,
  DepartmentChart,
  SlaChart,
  TenantChart,
  TicketChart,
} from "@/feature/serviceDesk/ticket/client";
import { NS } from "@/lib/application/i18n";

import type {
  ChartSelectionHandler,
  ChartViewMode,
  InsightsChartData,
} from "../types";

type InsightsChartGridProps = {
  chartViewMode: ChartViewMode;
  chartData: InsightsChartData;
  isLoading: boolean;
  chartFilter: ChartFilter;
  showTenantChart: boolean;
  chartBaseDescription: string;
  onChartSelect: ChartSelectionHandler;
};

export function InsightsChartGrid({
  chartViewMode,
  chartData,
  isLoading,
  chartFilter,
  showTenantChart,
  chartBaseDescription,
  onChartSelect,
}: InsightsChartGridProps) {
  const { t } = useTranslation(NS.serviceDesk);
  const { t: tCommon } = useTranslation(NS.common);
  const isChartHidden = chartViewMode === "hidden";
  const chartCardMode = chartViewMode === "compact" ? "compact" : "full";
  const chartGridClassName =
    chartViewMode === "compact"
      ? showTenantChart
        ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      : "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3";

  return (
    <section className="z-20 rounded-md bg-background/95 pb-2 backdrop-blur supports-backdrop-filter:bg-background/80 md:sticky md:top-0 md:pb-3">
      <div className="flex flex-wrap items-start justify-between gap-1.5 text-xs text-muted-foreground sm:gap-2">
        <span className="min-w-0 wrap-break-word">{chartBaseDescription}</span>
        <span className="min-w-0 wrap-break-word">
          {t("insights.chartSummaryDescription")}
        </span>
      </div>

      {!isChartHidden ? (
        <section className={`mt-2 sm:mt-3 ${chartGridClassName}`}>
          <TicketChart
            title={t("insights.chart.statusTitle")}
            data={chartData.status}
            isLoading={isLoading}
            mode={chartCardMode}
            activeValue={
              chartFilter?.type === "status" ? chartFilter.value : undefined
            }
            onSelect={(item) => onChartSelect("status", item)}
            emptyMessage={tCommon("empty.noResults")}
          />
          <CategoryChart
            title={t("chart.category.title")}
            data={chartData.category}
            isLoading={isLoading}
            mode={chartCardMode}
            activeValue={
              chartFilter?.type === "category" ? chartFilter.value : undefined
            }
            onSelect={(item) => onChartSelect("category", item)}
            emptyMessage={tCommon("empty.noResults")}
          />
          <DepartmentChart
            title={t("chart.department.title")}
            data={chartData.department}
            isLoading={isLoading}
            mode={chartCardMode}
            activeValue={
              chartFilter?.type === "department"
                ? chartFilter.value
                : undefined
            }
            onSelect={(item) => onChartSelect("department", item)}
            emptyMessage={tCommon("empty.noResults")}
          />
          {showTenantChart ? (
            <TenantChart
              title={t("chart.tenant.title", {
                defaultValue: "Tickets by Tenant",
              })}
              data={chartData.tenant}
              isLoading={isLoading}
              mode={chartCardMode}
              activeValue={
                chartFilter?.type === "tenant" ? chartFilter.value : undefined
              }
              onSelect={(item) => onChartSelect("tenant", item)}
              emptyMessage={tCommon("empty.noResults")}
            />
          ) : null}
          <AssigneeChart
            title={t("chart.assignee.title")}
            data={chartData.assignee}
            isLoading={isLoading}
            mode={chartCardMode}
            activeValue={
              chartFilter?.type === "assignee" ? chartFilter.value : undefined
            }
            onSelect={(item) => onChartSelect("assignee", item)}
            emptyMessage={tCommon("empty.noResults")}
          />
          <SlaChart
            title={t("chart.sla.title")}
            data={chartData.sla}
            isLoading={isLoading}
            mode={chartCardMode}
            activeValue={
              chartFilter?.type === "sla" ? chartFilter.value : undefined
            }
            onSelect={(item) => onChartSelect("sla", item)}
            emptyMessage={tCommon("empty.noResults")}
          />
        </section>
      ) : null}
    </section>
  );
}
