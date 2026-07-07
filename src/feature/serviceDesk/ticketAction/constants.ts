export const TICKET_ACTION_PATHS = [
  "approve",
  "decline",
  "comment",
  "note",
  "assign",
  "assignSelf",
  "reject",
  "merge",
  "adjust",
  "reopen",
  "resubmit",
  "cancel",
] as const;

export type TicketActionPath = (typeof TICKET_ACTION_PATHS)[number];

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
} as const;

export const TICKET_ACTION_PATH_TO_TYPE = {
  approve: "APPROVE",
  decline: "DECLINE",
  comment: "COMMENT",
  note: "NOTE",
  assign: "ASSIGN",
  assignSelf: "ASSIGN_SELF",
  reject: "REJECT",
  merge: "MERGE",
  adjust: "ADJUST",
  reopen: "REOPEN",
  resubmit: "RESUBMIT",
  cancel: "CANCEL",
} as const;

export const TICKET_ACTION_FORM_MODES = [
  "approve",
  "decline",
  "comment",
  "note",
  "assign",
  "assignSelf",
  "adjust",
  "merge",
  "reject",
  "reopen",
  "resubmit",
  "cancel",
] as const;
