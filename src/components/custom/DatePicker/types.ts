import { VariantProps } from "class-variance-authority";
import { DateRange } from "react-day-picker";

import { selectVariants } from "@/components/ui/select";
import { DateRangePreset } from "@/shared/types";

export type SearchPeriod = "all" | DateRangePreset;

export type SelectVariant = VariantProps<typeof selectVariants>["variant"];

export type SearchDateFilterOption<T extends string = string> = {
  value: T;
  label: string;
};

export type DateRangePickerProps = {
  period: DateRangePreset | undefined;
  onPeriodChange: (value?: DateRangePreset) => void;
  range: DateRange | undefined;
  onRangeChange: (value?: DateRange) => void;
  showRangeText?: boolean;
  options?: DateRangePreset[];
  variant?: SelectVariant;
  className?: string;
};

export type SearchDateFilterProps<T extends string = SearchPeriod> = {
  value?: T;
  onValueChange: (value?: T) => void;
  range?: DateRange;
  onRangeChange: (value?: DateRange) => void;
  options: SearchDateFilterOption<T>[];
  rangeValue?: T;
  resolveRange?: (value: T) => DateRange | undefined;
  showRangeText?: boolean;
  variant?: SelectVariant;
  className?: string;
};
