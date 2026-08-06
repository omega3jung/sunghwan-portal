import type { ChartDatum } from "@/shared/types";

/** Stage identifiers shared by ticket creation and update workflows. */
export type TicketStep = "info" | "attachment" | "review";

/** Leaf aggregate used beneath a category chart datum. */
export type SubCategoryChartData = ChartDatum;

/** Category aggregate with an optional nested subcategory series. */
export type CategoryChartData = ChartDatum & {
  children?: SubCategoryChartData[];
};
