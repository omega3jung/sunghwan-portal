export type SystemStatus =
  | "Pre"
  | "Open"
  | "Approved"
  | "Declined"
  | "Working"
  | "Pending"
  | "Resolved"
  | "Closed";

export interface StatusBadgeProps {
  status?: SystemStatus;
  size?: "sm" | "md";
}
