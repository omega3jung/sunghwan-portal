import { formatDistance, formatISO, Locale } from "date-fns";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = MINUTES_PER_HOUR * 24;
const MINUTES_PER_MONTH = MINUTES_PER_DAY * 30;
const MINUTES_PER_YEAR = MINUTES_PER_DAY * 365;

/**
 * Formats a date-like value as a relative time string from now.
 *
 * Use for:
 * - Showing "x minutes ago" labels in activity feeds
 * - Displaying relative timestamps for records or comments
 *
 * @param timeStamp - The date value to compare against the current time
 * @param locale - The optional `date-fns` locale used to localize the relative message
 * @returns A relative time string with a suffix, or an empty string when no timestamp is provided
 */
export const formatTimeDistanceFromNow = (
  timeStamp?: string | Date | null | undefined,
  locale?: Locale,
) => {
  if (!timeStamp) {
    return "";
  }

  const date = typeof timeStamp === "string" ? new Date(timeStamp) : timeStamp;

  return formatDistance(new Date(), date, { locale, addSuffix: true });
};

/**
 * Formats a timestamp into a compact elapsed label such as `14d`, `3h`, or `2mo`.
 *
 * @param timeStamp - The date value to compare against the current time
 * @returns A compact elapsed label, or an empty string when the input is invalid
 */
export const formatCompactTimeDistanceFromNow = (
  timeStamp?: string | Date | null,
) => {
  if (!timeStamp) {
    return "";
  }

  const date = typeof timeStamp === "string" ? new Date(timeStamp) : timeStamp;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const diffInMinutes = Math.max(
    0,
    Math.floor(Math.abs(Date.now() - date.getTime()) / (1000 * 60)),
  );

  return formatCompactDurationFromMinutes(diffInMinutes);
};

/**
 * Formats a duration in minutes into a compact label such as `45m`, `3h`, or `2mo`.
 *
 * @param minutes - The total duration in minutes
 * @returns A compact duration label, or an empty string when the input is invalid
 */
export const formatCompactDurationFromMinutes = (
  minutes?: number | null,
) => {
  if (minutes == null || Number.isNaN(minutes)) {
    return "";
  }

  const safeMinutes = Math.max(0, Math.floor(minutes));

  if (safeMinutes < MINUTES_PER_HOUR) {
    return `${safeMinutes}m`;
  }

  if (safeMinutes < MINUTES_PER_DAY) {
    return `${Math.floor(safeMinutes / MINUTES_PER_HOUR)}h`;
  }

  if (safeMinutes < MINUTES_PER_MONTH) {
    return `${Math.floor(safeMinutes / MINUTES_PER_DAY)}d`;
  }

  if (safeMinutes < MINUTES_PER_YEAR) {
    return `${Math.floor(safeMinutes / MINUTES_PER_MONTH)}mo`;
  }

  return `${Math.floor(safeMinutes / MINUTES_PER_YEAR)}y`;
};

/**
 * Formats a date-like value as an ISO calendar date string.
 *
 * Use for:
 * - Normalizing dates for API parameters or HTML inputs
 * - Rendering date-only values without time information
 *
 * @param date - The date-like value to convert into `YYYY-MM-DD` format
 * @returns An ISO date string, or an empty string when the input is nullish
 */
export const formatISODate = (date?: string | number | Date) => {
  if (date == null) return "";

  return formatISO(date, { representation: "date" });
};
