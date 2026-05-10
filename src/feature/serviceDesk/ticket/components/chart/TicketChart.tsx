import { SummaryChartCard } from "./SummaryChartCard";
import { SummaryChartProps } from "./types";

type TicketChartProps = Omit<SummaryChartProps, "title"> & {
  title?: string;
};

export function TicketChart({
  title = "Tickets by Status",
  ...props
}: TicketChartProps) {
  return <SummaryChartCard title={title} chartType="donut" {...props} />;
}
