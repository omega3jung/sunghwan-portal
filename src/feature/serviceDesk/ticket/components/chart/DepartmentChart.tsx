import { SummaryChartCard } from "./SummaryChartCard";
import { SummaryChartProps } from "./types";

type DepartmentChartProps = Omit<SummaryChartProps, "title"> & {
  title?: string;
};

/** Documents the department chart responsibility exposed by this client feature module. */
export function DepartmentChart({
  title = "Tickets by Department",
  ...props
}: DepartmentChartProps) {
  return <SummaryChartCard title={title} {...props} />;
}
