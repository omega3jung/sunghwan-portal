import {
  addMonths,
  addWeeks,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { DateRange } from "react-day-picker";

import {
  DATE_FORMAT,
  DEFAULT_DATE_RANGE_PRESETS,
  WEEK_STARTS_ON,
} from "@/shared/constants/date";
import { DateRangePreset } from "@/shared/types";

const DATE_RANGE_PRESET_SET = new Set<string>(DEFAULT_DATE_RANGE_PRESETS);

export function formatRangeText(range?: DateRange) {
  if (!range?.from) {
    return "";
  }

  if (!range.to) {
    return format(range.from, DATE_FORMAT);
  }

  return `${format(range.from, DATE_FORMAT)} - ${format(range.to, DATE_FORMAT)}`;
}

export function getRelativeStartDate(period: DateRangePreset, today: Date) {
  const match = /^last_(\d+)?(week|month|year)$/.exec(period);

  if (!match) {
    return today;
  }

  const [, amountValue, unit] = match;
  const amount = amountValue ? Number.parseInt(amountValue, 10) : 1;

  if (Number.isNaN(amount)) {
    return today;
  }

  switch (unit) {
    case "week":
      return addWeeks(today, -amount);
    case "month":
      return addMonths(today, -amount);
    case "year":
      return addYears(today, -amount);
    default:
      return today;
  }
}

export function isDateRangePreset(value: string): value is DateRangePreset {
  return DATE_RANGE_PRESET_SET.has(value);
}

export function resolvePresetRange(
  period: DateRangePreset,
): DateRange | undefined {
  const today = new Date();

  switch (period) {
    case "today":
      return { from: today, to: today };

    case "this_week":
      return {
        from: startOfWeek(today, { weekStartsOn: WEEK_STARTS_ON }),
        to: endOfWeek(today, { weekStartsOn: WEEK_STARTS_ON }),
      };

    case "this_month":
      return {
        from: startOfMonth(today),
        to: endOfMonth(today),
      };

    case "this_year":
      return {
        from: startOfYear(today),
        to: endOfYear(today),
      };

    case "range":
      return undefined;

    default:
      return {
        from: getRelativeStartDate(period, today),
        to: today,
      };
  }
}
