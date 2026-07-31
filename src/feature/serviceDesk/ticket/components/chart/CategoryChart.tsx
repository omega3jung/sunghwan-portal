import { SummaryChartCard } from "./SummaryChartCard";
import { SummaryChartProps } from "./types";

type CategoryChartProps = Omit<SummaryChartProps, "title"> & {
  title?: string;
};

/** Documents the category chart responsibility exposed by this client feature module. */
export function CategoryChart({
  title = "Tickets by Category",
  ...props
}: CategoryChartProps) {
  return <SummaryChartCard title={title} {...props} />;
}
