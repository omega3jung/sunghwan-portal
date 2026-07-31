import type { ChartDatum } from "@/shared/types";

/** Models a labeled step in the ticket creation or update workflow. */
export type TicketStep = "info" | "attachment" | "review";

/** Describes a subcategory aggregate used by ticket charts. */
export type SubCategoryChartData = ChartDatum;

/** Describes a category aggregate and its nested subcategory series. */
export type CategoryChartData = ChartDatum & {
  children?: SubCategoryChartData[];
};
