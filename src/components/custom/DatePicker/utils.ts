import {
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
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

// Derive the guard from the rendered preset source to prevent the two lists drifting.
const DATE_RANGE_PRESET_SET = new Set<string>(DEFAULT_DATE_RANGE_PRESETS);

/** Accepts serialized dates because persisted form state may not retain `Date` instances. */
export function normalizeDateValue(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsedDate = new Date(value);

    return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  }

  return undefined;
}

/** A fully invalid range collapses to `undefined` instead of carrying empty endpoints. */
export function normalizeDateRange(range?: DateRange): DateRange | undefined {
  if (!range) {
    return undefined;
  }

  const from = normalizeDateValue(range.from);
  const to = normalizeDateValue(range.to);

  if (!from && !to) {
    return undefined;
  }

  return { from, to };
}

/** Returns an empty string for missing or invalid restored values so UI fallbacks can render. */
export function formatDateText(date?: Date | string | number) {
  const resolvedDate = normalizeDateValue(date);

  if (!resolvedDate) {
    return "";
  }

  return format(resolvedDate, DATE_FORMAT);
}

/** Uses the same tolerant input contract as `formatDateText` with 24-hour time. */
export function formatDateTimeText(date?: Date | string | number) {
  const resolvedDate = normalizeDateValue(date);

  if (!resolvedDate) {
    return "";
  }

  return format(resolvedDate, `${DATE_FORMAT} HH:mm`);
}

/** A range with only `from` renders as a single date until the endpoint is chosen. */
export function formatRangeText(range?: DateRange) {
  const normalizedRange = normalizeDateRange(range);

  if (!normalizedRange?.from) {
    return "";
  }

  if (!normalizedRange.to) {
    return formatDateText(normalizedRange.from);
  }

  return `${formatDateText(normalizedRange.from)} ~ ${formatDateText(normalizedRange.to)}`;
}

/** The explicit anchor keeps relative presets stable across renders and restoration. */
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

/** `range` has no derived value because its dates must come from calendar interaction. */
export function resolvePresetRange(
  period: DateRangePreset,
  baseDate: Date = new Date(),
): DateRange | undefined {
  const today = new Date(baseDate);

  switch (period) {
    case "today": {
      const from = new Date(today);
      const to = new Date(today);

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 0);

      return { from, to };
    }

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

/** Compares restored serialized dates and live dates by their effective timestamps. */
export function isSameDateRange(a?: DateRange, b?: DateRange): boolean {
  const normalizedA = normalizeDateRange(a);
  const normalizedB = normalizeDateRange(b);
  const aFrom = normalizedA?.from?.getTime() ?? null;
  const aTo = normalizedA?.to?.getTime() ?? null;
  const bFrom = normalizedB?.from?.getTime() ?? null;
  const bTo = normalizedB?.to?.getTime() ?? null;

  return aFrom === bFrom && aTo === bTo;
}

/**
 * A partially available day stays selectable; time controls enforce the exact
 * min/max boundary after the calendar chooses that day.
 */
export function isCalendarDateDisabled(
  date: Date,
  minDate?: Date,
  maxDate?: Date,
) {
  if (minDate && endOfDay(date) < minDate) {
    return true;
  }

  if (maxDate && startOfDay(date) > maxDate) {
    return true;
  }

  return false;
}
