import { Role } from "@/domain/auth";

import { TicketStatus } from "../../types";

/** User-intent and workflow action kinds recorded for Service Desk tickets. */
export type TicketActionType =
  | "APPROVE"
  | "DECLINE"
  | "COMMENT"
  | "NOTE"
  | "ASSIGN"
  | "ASSIGN_SELF"
  | "REJECT"
  | "MERGE"
  | "ADJUST"
  | "REOPEN"
  | "RESUBMIT"
  | "CANCEL";

/** Represents action constraint within the Service Desk domain. */
export type ActionConstraint = {
  allowedStatus?: TicketStatus[];
  allowedRoles?: Role[];
  requiresOwnership?: "requester" | "assignee";
  blockedWhenLocked?: boolean;
};
