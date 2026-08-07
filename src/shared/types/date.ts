/** String contract for timestamps serialized in ISO 8601 form. */
export type ISODateString = string;

/** Date-range choices supported by shared filter controls and query builders. */
export type DateRangePreset =
  | "today"
  | "this_week"
  | "this_month"
  | "this_year"
  | "last_week"
  | "last_2week"
  | "last_3week"
  | "last_4week"
  | "last_month"
  | "last_2month"
  | "last_3month"
  | "last_4month"
  | "last_5month"
  | "last_6month"
  | "last_7month"
  | "last_8month"
  | "last_9month"
  | "last_10month"
  | "last_11month"
  | "last_year"
  | "last_2year"
  | "range";
