import { DateRangePreset } from "../types";

/** Translation keys used to label each supported date-range preset. */
export const DATE_RANGE_PRESET_LABEL_KEYS: Record<DateRangePreset, string> = {
  today: "today",
  this_week: "thisWeek",
  this_month: "thisMonth",
  this_year: "thisYear",
  last_week: "lastWeek",
  last_2week: "last2Week",
  last_3week: "last3Week",
  last_4week: "last4Week",
  last_month: "lastMonth",
  last_2month: "last2Month",
  last_3month: "last3Month",
  last_4month: "last4Month",
  last_5month: "last5Month",
  last_6month: "last6Month",
  last_7month: "last7Month",
  last_8month: "last8Month",
  last_9month: "last9Month",
  last_10month: "last10Month",
  last_11month: "last11Month",
  last_year: "lastYear",
  last_2year: "last2Year",
  range: "dateRange",
};

/** Calendar weeks start on Monday across shared date controls. */
export const WEEK_STARTS_ON = 1 as const;
/** Calendar-date format used where time and timezone are intentionally omitted. */
export const DATE_FORMAT = "yyyy-MM-dd";

/**
 * Canonical presentation order for selectable range presets. Consumers rely on
 * this order when restoring and sorting user-selected options.
 */
export const DEFAULT_DATE_RANGE_PRESETS: DateRangePreset[] = [
  "today",
  "this_week",
  "this_month",
  "this_year",
  "last_week",
  "last_2week",
  "last_3week",
  "last_4week",
  "last_month",
  "last_2month",
  "last_3month",
  "last_4month",
  "last_5month",
  "last_6month",
  "last_7month",
  "last_8month",
  "last_9month",
  "last_10month",
  "last_11month",
  "last_year",
  "last_2year",
  "range",
];
