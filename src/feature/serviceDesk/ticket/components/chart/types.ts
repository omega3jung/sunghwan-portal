export type ChartFilter =
  | {
      type: "status" | "category" | "department" | "assignee" | "sla";
      value: string;
      label: string;
    }
  | null;

export type ChartSummaryItem = {
  value: string;
  label: string;
  count: number;
};

export type SlaBucketValue = "overdue" | "dueToday" | "dueThisWeek" | "later";
export type ChartCardMode = "full" | "compact";

export type SummaryChartProps = {
  title: string;
  data: ChartSummaryItem[];
  isLoading?: boolean;
  activeValue?: string;
  onSelect?: (item: ChartSummaryItem) => void;
  emptyMessage?: string;
  chartType?: "bar" | "donut";
  mode?: ChartCardMode;
};
