import { SummaryChartCard } from "./SummaryChartCard";
import { SummaryChartProps } from "./types";

type SlaChartProps = Omit<SummaryChartProps, "title"> & {
  title?: string;
};

export function SlaChart({ title = "SLA Status", ...props }: SlaChartProps) {
  return <SummaryChartCard title={title} chartType="donut" {...props} />;
}
