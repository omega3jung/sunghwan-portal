import { formatDistance, formatISO, Locale } from "date-fns";

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
