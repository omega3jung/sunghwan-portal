export type SystemStatus =
  | "Draft"
  | "Open"
  | "Reopen"
  | "Approved"
  | "Declined"
  | "Working"
  | "Pending"
  | "Resolved"
  | "Rejected"
  | "Closed";

export interface StatusBadgeProps {
  status?: SystemStatus;
  size?: "sm" | "md";
}
