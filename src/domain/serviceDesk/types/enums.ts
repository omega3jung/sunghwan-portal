import { TicketSearchPeriod } from "@/domain/common";

/** Persisted workflow statuses exposed by the current Service Desk state model. */
export type TicketStatus =
  | "Draft" // creating ticket.
  | "Approval" // created. waiting for approval.
  | "Declined"
  | "Assigned" // 1-created without approval. 2-approved.
  | "Working"
  | "Pending"
  | "Rejected"
  | "Resolved"
  | "Closed";

/** Represents ticket period within the Service Desk domain. */
export type TicketPeriod = Exclude<TicketSearchPeriod, "today">;

/** Represents ticket attach within the Service Desk domain. */
export type TicketAttach = "file" | "image";

/** Represents note visibility within the Service Desk domain. */
export type NoteVisibility =
  | "private" // visible only to the author.
  | "shared"; // visible to internal operators (assignees, managers) and the author.

/** Represents ticket resolution reason within the Service Desk domain. */
export type TicketResolutionReason =
  | "Completed"
  | "Merged"
  | "Escalated"
  | "Rejected"
  | "Declined"
  | "Canceled";
