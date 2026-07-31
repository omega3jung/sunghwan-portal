/** Documents the chart filter responsibility exposed by this client feature module. */
export type ChartFilter =
  | {
      type:
        | "status"
        | "category"
        | "department"
        | "tenant"
        | "assignee"
        | "sla";
      value: string;
      label: string;
    }
  | null;

/** Documents the chart summary item responsibility exposed by this client feature module. */
export type ChartSummaryItem = {
  value: string;
  label: string;
  count: number;
};

/** Documents the sla bucket value responsibility exposed by this client feature module. */
export type SlaBucketValue = "overdue" | "dueToday" | "dueThisWeek" | "later";
/** Documents the chart card mode responsibility exposed by this client feature module. */
export type ChartCardMode = "full" | "compact";

/** Documents the summary chart props responsibility exposed by this client feature module. */
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
