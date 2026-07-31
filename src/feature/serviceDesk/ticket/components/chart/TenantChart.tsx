import { SummaryChartCard } from "./SummaryChartCard";
import { SummaryChartProps } from "./types";

type TenantChartProps = Omit<SummaryChartProps, "title"> & {
  title?: string;
};

/** Documents the tenant chart responsibility exposed by this client feature module. */
export function TenantChart({
  title = "Tickets by Tenant",
  ...props
}: TenantChartProps) {
  return <SummaryChartCard title={title} {...props} />;
}
