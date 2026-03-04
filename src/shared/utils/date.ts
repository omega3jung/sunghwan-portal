import { formatDistance, formatISO, Locale } from "date-fns";

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

export const formatISODate = (date?: string | number | Date) => {
  if (date == null) return "";

  return formatISO(date, { representation: "date" });
};
