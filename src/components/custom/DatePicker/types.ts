import { VariantProps } from "class-variance-authority";
import { DateRange } from "react-day-picker";

import type { ButtonProps } from "@/components/ui/button";
import { selectVariants } from "@/components/ui/select";
import { DateRangePreset } from "@/shared/types";

/** Adds the search-only `all` option to the shared date presets. */
export type SearchPeriod = "all" | DateRangePreset;

/** Keeps date-control triggers aligned with the shared Select variants. */
export type SelectVariant = VariantProps<typeof selectVariants>["variant"];

/** `text` shows the semantic label, `range` concrete dates, and `all` both. */
export type ShowTextType = "text" | "range" | "all";

/** Filter values are domain-specific; only their display label is shared. */
export type SearchDateFilterOption<T extends string = string> = {
  value: T;
  label: string;
};

/** Shared ownership contract for single-date controls. */
type BaseSingleDatePickerProps = {
  value: Date | undefined;
  onChange: (value?: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  modal?: boolean;
};

export type DatePickerProps = BaseSingleDatePickerProps &
  Omit<ButtonProps, "value" | "onChange">;

/** Supported steps divide an hour evenly and keep the minute list predictable. */
export type DateTimePickerMinuteStep = 1 | 5 | 10 | 15 | 30;

export type DateTimePickerProps = BaseSingleDatePickerProps &
  Omit<ButtonProps, "value" | "onChange"> & {
    compact?: boolean;
    minuteStep?: DateTimePickerMinuteStep;
    placeholder?: string;
  };

/** The concrete range is parent-owned in both preset ownership modes. */
type DateRangePickerBaseProps = {
  range: DateRange | undefined;
  onRangeChange: (value?: DateRange) => void;
  showTextType?: ShowTextType;
  options?: DateRangePreset[];
  variant?: SelectVariant;
  className?: string;
  modal?: boolean;
};

/** Controlled preset mode; `defaultPeriod` is disallowed to prevent mixed ownership. */
type ControlledDateRangePickerProps = {
  period: DateRangePreset | undefined;
  onPeriodChange: (value?: DateRangePreset) => void;
  defaultPeriod?: never;
};

/** The component owns only the preset; the parent still owns `range`. */
type UncontrolledDateRangePickerProps = {
  period?: never;
  onPeriodChange?: never;
  defaultPeriod?: DateRangePreset;
};

export type DateRangePickerProps = DateRangePickerBaseProps &
  (ControlledDateRangePickerProps | UncontrolledDateRangePickerProps);

/**
 * Filter values remain generic so domain-specific presets can reuse the range
 * interaction. `rangeValue` opens free-form selection; other values are
 * converted to the parent-owned range through `resolveRange`.
 */
export type SearchDateFilterProps<T extends string = SearchPeriod> = {
  value?: T;
  onValueChange: (value?: T) => void;
  range?: DateRange;
  onRangeChange: (value?: DateRange) => void;
  options: SearchDateFilterOption<T>[];
  rangeValue?: T;
  resolveRange?: (value: T) => DateRange | undefined;
  showTextType?: ShowTextType;
  variant?: SelectVariant;
  className?: string;
  modal?: boolean;
};
