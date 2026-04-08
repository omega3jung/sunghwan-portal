import { ChartDatum } from "@/shared/types";

export type SubCategoryChartData = ChartDatum;
export type CategoryChartData = ChartDatum & {
  children?: SubCategoryChartData[];
};
