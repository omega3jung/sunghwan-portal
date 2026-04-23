import { VariantProps } from "class-variance-authority";
import { DateRange } from "react-day-picker";

import type { ButtonProps } from "@/components/ui/button";
import { selectVariants } from "@/components/ui/select";
import { DateRangePreset } from "@/shared/types";

/**
 * SearchDateFilter keeps its value generic, but still needs to interoperate with
 * shared date preset values in some places.
 */
export type SearchPeriod = "all" | DateRangePreset;

/**
 * Reuse the visual variants from the shared Select trigger so date controls stay aligned
 * with the rest of the design system.
 */
export type SelectVariant = VariantProps<typeof selectVariants>["variant"];

/**
 * Trigger text can show:
 * - only the semantic label
 * - only the concrete date range
 * - both together
 *
 * Components decide trigger display from this policy, while dropdown item labels stay unchanged.
 */
export type ShowTextType = "text" | "range" | "all";

/**
 * SearchDateFilter is generic because the selectable values are domain-specific.
 * Only the display label is universal.
 */
export type SearchDateFilterOption<T extends string = string> = {
  value: T;
  label: string;
};

/**
 * Shared single-value picker contract for date-like controls.
 * DatePicker and DateTimePicker intentionally stay separate components,
 * but they share the same ownership model for a single Date value.
 */
type BaseSingleDatePickerProps = {
  value?: Date;
  defaultValue?: Date;
  onChange?: (value?: Date) => void;
  minDate?: Date;
  maxDate?: Date;
};

/**
 * DatePicker remains date-only and keeps the existing button ergonomics.
 */
export type DatePickerProps = BaseSingleDatePickerProps &
  Omit<ButtonProps, "value" | "defaultValue" | "onChange">;

/**
 * DateTimePicker minute options stay constrained to common 24-hour schedules.
 */
export type DateTimePickerMinuteStep = 1 | 5 | 10 | 15 | 30;

/**
 * DateTimePicker adds compact layout and time stepping while keeping
 * the same single-Date ownership model as DatePicker.
 */
export type DateTimePickerProps = BaseSingleDatePickerProps &
  Omit<ButtonProps, "value" | "defaultValue" | "onChange"> & {
    compact?: boolean;
    minuteStep?: DateTimePickerMinuteStep;
    placeholder?: string;
  };

/**
 * Shared DateRangePicker props that apply regardless of how the period itself is owned.
 * The actual date range is always parent-owned.
 */
type DateRangePickerBaseProps = {
  range: DateRange | undefined;
  onRangeChange: (value?: DateRange) => void;
  showTextType?: ShowTextType;
  options?: DateRangePreset[];
  variant?: SelectVariant;
  className?: string;
};

/**
 * Controlled mode:
 * the parent owns both the selected preset and the concrete range.
 * defaultPeriod is intentionally disallowed here to avoid mixed ownership.
 */
type ControlledDateRangePickerProps = {
  period: DateRangePreset | undefined;
  onPeriodChange: (value?: DateRangePreset) => void;
  defaultPeriod?: never;
};

/**
 * Uncontrolled period mode:
 * the component manages the selected preset internally, but the parent still owns the actual range.
 */
type UncontrolledDateRangePickerProps = {
  period?: never;
  onPeriodChange?: never;
  defaultPeriod?: DateRangePreset;
};

/**
 * DateRangePicker supports controlled and uncontrolled preset selection,
 * but never mixed ownership of the preset state.
 */
export type DateRangePickerProps = DateRangePickerBaseProps &
  (ControlledDateRangePickerProps | UncontrolledDateRangePickerProps);

/**
 * SearchDateFilter keeps the selected value generic so it can represent domain filters
 * such as due dates while still borrowing the same date-range interaction model.
 *
 * `rangeValue` marks the option that should open the calendar instead of resolving a preset.
 * `resolveRange` is the bridge from a preset-like value to a concrete parent-owned range.
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
};
