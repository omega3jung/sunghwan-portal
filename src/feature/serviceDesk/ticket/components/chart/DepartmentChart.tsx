import { SummaryChartCard } from "./SummaryChartCard";
import { SummaryChartProps } from "./types";

type DepartmentChartProps = Omit<SummaryChartProps, "title"> & {
  title?: string;
};

export function DepartmentChart({
  title = "Tickets by Department",
  ...props
}: DepartmentChartProps) {
  return <SummaryChartCard title={title} {...props} />;
}
