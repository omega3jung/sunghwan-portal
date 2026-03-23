export type SystemStatus =
  | "Draft"
  | "Open"
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
