import { SummaryChartCard } from "./SummaryChartCard";
import { SummaryChartProps } from "./types";

type TenantChartProps = Omit<SummaryChartProps, "title"> & {
  title?: string;
};

export function TenantChart({
  title = "Tickets by Tenant",
  ...props
}: TenantChartProps) {
  return <SummaryChartCard title={title} {...props} />;
}
