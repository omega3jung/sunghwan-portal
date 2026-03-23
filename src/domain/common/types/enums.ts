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
  | "thisWeek"
  | "this2Week"
  | "thisMonth"
  | "lastWeek"
  | "last2Week"
  | "lastMonth"
  | "last6Month"
  | "range";

export type DueDate =
  | "all"
  | "overdue"
  | "today"
  | "thisWeek"
  | "this2Week"
  | "thisMonth"
  | "withinWeek"
  | "within2Week"
  | "withinMonth"
  | "range";
