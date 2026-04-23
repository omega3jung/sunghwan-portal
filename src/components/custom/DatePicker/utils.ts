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

/**
 * Preset validation is intentionally data-driven so the type guard stays aligned
 * with the shared preset list rather than duplicating string literals here.
 */
const DATE_RANGE_PRESET_SET = new Set<string>(DEFAULT_DATE_RANGE_PRESETS);

/**
 * External state restoration can rehydrate dates as strings or numbers.
 * Utility consumers should not need to care about that distinction,
 * so this helper normalizes supported date-like inputs into real Date instances.
 */
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

/**
 * Components compare, format, and render ranges more safely when inputs are normalized first.
 * Returning undefined for a fully invalid range keeps downstream logic simple and defensive.
 */
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

/**
 * Trigger and summary text should tolerate restored string dates as well as live Date objects.
 * Formatting returns an empty string instead of throwing so UI fallbacks can take over.
 */
export function formatDateText(date?: Date | string | number) {
  const resolvedDate = normalizeDateValue(date);

  if (!resolvedDate) {
    return "";
  }

  return format(resolvedDate, DATE_FORMAT);
}

/**
 * DateTimePicker renders a fixed 24-hour timestamp string in triggers and summaries.
 * Keeping this formatter beside formatDateText makes the single-value picker family consistent.
 */
export function formatDateTimeText(date?: Date | string | number) {
  const resolvedDate = normalizeDateValue(date);

  if (!resolvedDate) {
    return "";
  }

  return format(resolvedDate, `${DATE_FORMAT} HH:mm`);
}

/**
 * Range formatting is presentation-only.
 * It assumes the caller already decided whether the UI wants a full range, a single date,
 * or some other special-case text such as the "today" trigger policy.
 */
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

/**
 * Relative presets are resolved from an explicit anchor date so callers can keep
 * preset-derived ranges stable across a render cycle or restored state sync.
 */
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

/**
 * Runtime type guard used when generic string values may actually be shared date presets.
 */
export function isDateRangePreset(value: string): value is DateRangePreset {
  return DATE_RANGE_PRESET_SET.has(value);
}

/**
 * Converts a shared preset into the concrete date range the parent state should store.
 * "range" intentionally resolves to undefined because free-form selection must come from the calendar.
 */
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

/**
 * Range equality is normalization-aware so restored string dates and live Date objects
 * compare by effective timestamps rather than by raw input shape.
 */
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
 * Calendar day disabling should work from whole-day availability, not exact timestamps.
 * This lets DateTimePicker keep a partially available day selectable while time controls
 * handle the finer-grained min/max restriction.
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
