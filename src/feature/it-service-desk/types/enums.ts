export type Status =
  | "Pre"
  | "Open"
  | "Approved"
  | "Declined"
  | "Working"
  | "Pending"
  | "Resolved"
  | "Closed";

export type Periods = "W" | "M" | "1" | "2" | "6" | "P";

export type DueDate = "A" | "D" | "T" | "W" | "M" | "1";

export type Priority = "Low" | "Medium" | "High" | "Urgent";

export type AttachFile = "FILE" | "IMAGE";

export type TicketTab = "approval" | "open" | "closed" | "overdue";

export type RiskLevel = "Low" | "Medium" | "High";
