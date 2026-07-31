import {
  Bar,
  BarChart,
  type BarShapeProps,
  CartesianGrid,
  LabelList,
  Pie,
  PieChart,
  type PieSectorShapeProps,
  Rectangle,
  Sector,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/utils/presentation";

import { SummaryChartProps } from "./types";

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

const chartConfig = {
  count: {
    label: "Tickets",
    color: CHART_COLORS[0],
  },
} satisfies ChartConfig;

const ACTIVE_COLOR = "var(--primary)";
const DEFAULT_COLOR = CHART_COLORS[2];

const SummaryChartSkeleton = () => {
  return (
    <div className="space-y-3 px-1 py-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-6 w-full" />
      ))}
    </div>
  );
};

const truncateLabel = (label: string, maxLength: number): string => {
  if (label.length <= maxLength) {
    return label;
  }

  return `${label.slice(0, maxLength)}...`;
};

/** Documents the summary chart card responsibility exposed by this client feature module. */
export const SummaryChartCard = ({
  title,
  data,
  isLoading = false,
  activeValue,
  onSelect,
  emptyMessage = "No data",
  chartType = "bar",
  mode = "full",
}: SummaryChartProps) => {
  const isCompact = mode === "compact";
  const minCardHeightClass = isCompact ? "min-h-[240px]" : "min-h-[290px]";
  const chartContentHeightClass = isCompact ? "h-[180px]" : "h-[230px]";
  const emptyStateHeightClass = isCompact ? "h-36" : "h-48";
  const chartContainerHeightClass = isCompact ? "h-40" : "h-56";
  const barMargin = isCompact
    ? { top: 4, right: 24, left: 4, bottom: 4 }
    : { top: 4, right: 32, left: 4, bottom: 4 };
  const labelMaxLength = isCompact ? 12 : 18;
  const yAxisWidth = isCompact ? 90 : 110;
  const donutInnerRadius = isCompact ? 38 : 48;
  const donutOuterRadius = isCompact ? 62 : 78;
  const chartData = data.filter((item) => item.count > 0);
  const hasChartData = chartData.length > 0;

  return (
    <Card className={minCardHeightClass}>
      <CardHeader className={cn("pb-2", isCompact && "pb-1")}>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className={chartContentHeightClass}>
        {isLoading ? <SummaryChartSkeleton /> : null}

        {!isLoading && !hasChartData ? (
          <div
            className={cn(
              "flex items-center justify-center text-sm text-muted-foreground",
              emptyStateHeightClass,
            )}
          >
            {emptyMessage}
          </div>
        ) : null}

        {!isLoading && hasChartData && chartType === "bar" ? (
          <ChartContainer
            config={chartConfig}
            className={cn("w-full", chartContainerHeightClass)}
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={barMargin}
              barCategoryGap={isCompact ? 4 : 8}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" dataKey="count" hide />
              <YAxis
                type="category"
                dataKey="label"
                tickLine={false}
                axisLine={false}
                width={yAxisWidth}
                tickFormatter={(label: string) =>
                  truncateLabel(label, labelMaxLength)
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const count = Number(value);
                      const label = String(item.payload.label ?? item.name);
                      return (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium text-foreground">
                            {count}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar
                dataKey="count"
                radius={4}
                shape={(props: BarShapeProps) => {
                  const item = chartData[props.index];
                  const selected = activeValue === item?.value;

                  return (
                    <Rectangle
                      {...props}
                      cursor={onSelect ? "pointer" : "default"}
                      fill={selected ? ACTIVE_COLOR : DEFAULT_COLOR}
                      fillOpacity={selected ? 1 : 0.7}
                      className={cn(
                        onSelect && "transition-opacity hover:opacity-90",
                      )}
                    />
                  );
                }}
                onClick={(_data, index) => {
                  const item = chartData[index];

                  if (item) {
                    onSelect?.(item);
                  }
                }}
              >
                <LabelList
                  dataKey="count"
                  position="right"
                  className="fill-foreground text-[11px]"
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : null}

        {!isLoading && hasChartData && chartType === "donut" ? (
          <ChartContainer
            config={chartConfig}
            className={cn("w-full", chartContainerHeightClass)}
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, _name, item) => {
                      const count = Number(value);
                      const label = String(item.payload.label ?? item.name);

                      return (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium text-foreground">
                            {count}
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={donutInnerRadius}
                outerRadius={donutOuterRadius}
                paddingAngle={2}
                label={({ name, payload }) =>
                  String(payload?.label ?? name ?? "")
                }
                shape={(props: PieSectorShapeProps) => {
                  const item = chartData[props.index];
                  const selected = activeValue === item?.value;

                  return (
                    <Sector
                      {...props}
                      cursor={onSelect ? "pointer" : "default"}
                      fill={CHART_COLORS[props.index % CHART_COLORS.length]}
                      fillOpacity={selected ? 1 : 0.7}
                      stroke={selected ? ACTIVE_COLOR : "transparent"}
                      strokeWidth={selected ? 2 : 1}
                      className={cn(
                        onSelect && "transition-opacity hover:opacity-90",
                      )}
                    />
                  );
                }}
                onClick={(_data, index) => {
                  const item = chartData[index];

                  if (item) {
                    onSelect?.(item);
                  }
                }}
              >
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : null}
      </CardContent>
    </Card>
  );
};
