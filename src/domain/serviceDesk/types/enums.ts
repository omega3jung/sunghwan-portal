import { TicketSearchPeriod } from "@/domain/common";

/** Persisted workflow statuses exposed by the current Service Desk state model. */
export type TicketStatus =
  | "Draft" // Being created and not yet submitted.
  | "Approval" // Submitted and waiting for approval.
  | "Declined"
  | "Assigned" // Created without approval or advanced after approval.
  | "Working"
  | "Pending"
  | "Rejected"
  | "Resolved"
  | "Closed";

export type TicketPeriod = Exclude<TicketSearchPeriod, "today">;

export type TicketAttach = "file" | "image";

export type NoteVisibility =
  | "private" // visible only to the author.
  | "shared"; // visible to internal operators (assignees, managers) and the author.

export type TicketResolutionReason =
  | "Completed"
  | "Merged"
  | "Escalated"
  | "Rejected"
  | "Declined"
  | "Canceled";
