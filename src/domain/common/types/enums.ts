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

export type Period =
  | "today"
  | "thisWeek"
  | "this2Week"
  | "thisMonth"
  | "lastWeek"
  | "last2Week"
  | "lastMonth"
  | "last6Month"
  | "custom";

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
  | "custom";
