import { SummaryChartCard } from "./SummaryChartCard";
import { SummaryChartProps } from "./types";

type AssigneeChartProps = Omit<SummaryChartProps, "title"> & {
  title?: string;
};

export function AssigneeChart({
  title = "Tickets by Assignee",
  ...props
}: AssigneeChartProps) {
  return <SummaryChartCard title={title} {...props} />;
}
