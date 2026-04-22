export const TICKET_ACTION_PATHS = [
  "comment",
  "note",
  "assign",
  "assignSelf",
  "reject",
  "merge",
  "adjust",
  "reopen",
  "resubmit",
] as const;

export type TicketActionPath = (typeof TICKET_ACTION_PATHS)[number];

export const TICKET_ACTION_TYPE_TO_PATH = {
  COMMENT: "comment",
  NOTE: "note",
  ASSIGN: "assign",
  ASSIGN_SELF: "assignSelf",
  REJECT: "reject",
  MERGE: "merge",
  ADJUST: "adjust",
  REOPEN: "reopen",
  RESUBMIT: "resubmit",
} as const;

export const TICKET_ACTION_PATH_TO_TYPE = {
  comment: "COMMENT",
  note: "NOTE",
  assign: "ASSIGN",
  assignSelf: "ASSIGN_SELF",
  reject: "REJECT",
  merge: "MERGE",
  adjust: "ADJUST",
  reopen: "REOPEN",
  resubmit: "RESUBMIT",
} as const;

export const TICKET_ACTION_FORM_MODES = [
  "comment",
  "note",
  "assign",
  "assignSelf",
  "adjust",
  "merge",
  "reject",
  "reopen",
  "resubmit",
] as const;
