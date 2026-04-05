export const PRIORITY = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const;

export type Priority = keyof typeof PRIORITY;

export const RISK_LEVEL = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const;

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

export type DueDate =
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
