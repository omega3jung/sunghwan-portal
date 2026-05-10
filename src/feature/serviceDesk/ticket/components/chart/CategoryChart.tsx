import { SummaryChartCard } from "./SummaryChartCard";
import { SummaryChartProps } from "./types";

type CategoryChartProps = Omit<SummaryChartProps, "title"> & {
  title?: string;
};

export function CategoryChart({
  title = "Tickets by Category",
  ...props
}: CategoryChartProps) {
  return <SummaryChartCard title={title} {...props} />;
}
