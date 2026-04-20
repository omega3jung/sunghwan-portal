import type { ChartDatum } from "@/shared/types";

export type TicketStep = "info" | "attachment" | "review";

export type SubCategoryChartData = ChartDatum;

export type CategoryChartData = ChartDatum & {
  children?: SubCategoryChartData[];
};
