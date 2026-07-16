import type { TicketActionType } from "@/domain/serviceDesk";

export const TICKET_ACTION_TYPE_TO_PATH = {
  APPROVE: "approve",
  DECLINE: "decline",
  COMMENT: "comment",
  NOTE: "note",
  ASSIGN: "assign",
  ASSIGN_SELF: "assignSelf",
  REJECT: "reject",
  MERGE: "merge",
  ADJUST: "adjust",
  REOPEN: "reopen",
  RESUBMIT: "resubmit",
  CANCEL: "cancel",
} as const satisfies Record<TicketActionType, string>;

export type TicketActionPath =
  (typeof TICKET_ACTION_TYPE_TO_PATH)[TicketActionType];

export type TicketActionAttachment = {
  id: string;
  name: string;
  size: number;
  url?: string;
};

export type TicketActionFormValues = {
  id: string;
  actionType: TicketActionType;
  content: string;
  files: TicketActionAttachment[];
  images: TicketActionAttachment[];
  assigneeUsernames?: string[];
  categoryId?: string;
  targetTicketId?: string;
  priority?: string;
  riskLevel?: string;
  dueAt?: string;
};
