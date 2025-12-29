import { VariantProps } from "class-variance-authority";
import { SetStateAction } from "react";
import { DateRange } from "react-day-picker";

import { selectVariants } from "@/components/ui/select";

export type Range = {
  today: string;
  this_week: string;
  this_month: string;
  this_year: string;
  last_week: string;
  last_2week: string;
  last_3week: string;
  last_4week: string;
  last_month: string;
  last_2month: string;
  last_3month: string;
  last_4month: string;
  last_5month: string;
  last_6month: string;
  last_7month: string;
  last_8month: string;
  last_9month: string;
  last_10month: string;
  last_11month: string;
  last_year: string;
  last_2year: string;
  range: string;
};

export type Period =
  | "today"
  | "this_week"
  | "this_month"
  | "this_year"
  | "last_week"
  | "last_2week"
  | "last_3week"
  | "last_4week"
  | "last_month"
  | "last_2month"
  | "last_3month"
  | "last_4month"
  | "last_5month"
  | "last_6month"
  | "last_7month"
  | "last_8month"
  | "last_9month"
  | "last_10month"
  | "last_11month"
  | "last_year"
  | "last_2year"
  | "range";

export type SelectVariant = VariantProps<typeof selectVariants>["variant"];

export type DatePickerProps = {
  period: Period | undefined;
  setPeriod: (value: SetStateAction<Period | undefined>) => void;
  range: DateRange | undefined;
  setRange: (value: SetStateAction<DateRange | undefined>) => void;
  showRange?: boolean;
  setRangeText?: (value: SetStateAction<string>) => void;
  options?: Array<Period>;
  variant?: SelectVariant;
  className?: string;
};
