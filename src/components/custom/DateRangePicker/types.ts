import { VariantProps } from "class-variance-authority";
import { SetStateAction } from "react";
import { DateRange } from "react-day-picker";
import { selectVariants } from "@/components/ui/select";

export type Range = {
  today: String;
  this_week: String;
  this_month: String;
  this_year: String;
  last_week: String;
  last_2week: String;
  last_3week: String;
  last_4week: String;
  last_month: String;
  last_2month: String;
  last_3month: String;
  last_4month: String;
  last_5month: String;
  last_6month: String;
  last_7month: String;
  last_8month: String;
  last_9month: String;
  last_10month: String;
  last_11month: String;
  last_year: String;
  last_2year: String;
  range: String;
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
