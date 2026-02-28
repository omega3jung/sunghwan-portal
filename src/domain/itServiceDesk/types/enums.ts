export type Status =
  | "Pre"
  | "Open"
  | "Approved"
  | "Declined"
  | "Working"
  | "Pending"
  | "Resolved"
  | "Closed";

export type Period =
  | "week"
  | "month"
  | "lastMonth"
  | "last2Month"
  | "last6Month"
  | "period";

export type DueDate =
  | "all"
  | "overdue"
  | "today"
  | "week"
  | "month"
  | "lastMonth";

export type Priority = "low" | "medium" | "high" | "urgent";

export type AttachFile = "file" | "image";

export type RiskLevel = "low" | "medium" | "high";
