import type { CategoryScope } from "@/domain/serviceDesk";
import type {
  ChartFilter,
  ChartSummaryItem,
} from "@/feature/serviceDesk/ticket/client";
import type { TicketSearchCriteriaFormValues } from "@/feature/serviceDesk/ticketSearch";

export type ViewOption = CategoryScope;

export type InsightsSearchState = TicketSearchCriteriaFormValues & {
  scope: ViewOption;
};

export type ChartViewMode = "full" | "compact" | "hidden";

export type CriteriaPeriodRange =
  TicketSearchCriteriaFormValues["period"]["dateRange"];

export type InsightsChartData = {
  status: ChartSummaryItem[];
  category: ChartSummaryItem[];
  department: ChartSummaryItem[];
  tenant: ChartSummaryItem[];
  assignee: ChartSummaryItem[];
  sla: ChartSummaryItem[];
};

export type ChartSelectionHandler = (
  type: NonNullable<ChartFilter>["type"],
  item: ChartSummaryItem,
) => void;
