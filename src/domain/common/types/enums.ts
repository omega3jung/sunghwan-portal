/** Defines the canonical priority values used by the shared domain model. */
export const PRIORITY = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const;

/** Represents priority within the shared domain model. */
export type Priority = keyof typeof PRIORITY;

/** Defines the canonical risk level values used by the shared domain model. */
export const RISK_LEVEL = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const;

/** Represents risk level within the shared domain model. */
export type RiskLevel = keyof typeof RISK_LEVEL;

// Subset of DateRangePreset, intentionally defined locally
// to keep Service Desk search criteria independent from shared preset changes.
export type TicketSearchPeriod =
  | "today"
  | "this_week"
  | "this_2week"
  | "this_month"
  | "last_week"
  | "last_2week"
  | "last_month"
  | "last_6month"
  | "range";

/** Represents due at within the shared domain model. */
export type dueAt =
  | "all"
  | "overdue"
  | "today"
  | "this_week"
  | "this_2week"
  | "this_month"
  | "within_week"
  | "within_2week"
  | "within_month"
  | "range";
