import { Role } from "@/domain/auth";

import { TicketStatus } from "../../types";

export type TicketActionType =
  | "COMMENT"
  | "NOTE"
  | "ASSIGN"
  | "REJECT"
  | "MERGE"
  | "ADJUST"
  | "REPORT_RESOLVED"
  | "REVIEW_REJECTED"
  | "ASSIGN_MYSELF";

export type ActionConstraint = {
  allowedStatus?: TicketStatus[];
  allowedRoles?: Role[];
  requiresOwnership?: "requester" | "assignee";
  blockedWhenLocked?: boolean;
};
