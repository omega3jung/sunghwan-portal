export const TICKET_ACTION_PATHS = [
  "comment",
  "note",
  "assign",
  "reject",
  "merge",
  "adjust",
] as const;

export type TicketActionPath = (typeof TICKET_ACTION_PATHS)[number];

export const TICKET_ACTION_TYPE_TO_PATH = {
  COMMENT: "comment",
  NOTE: "note",
  ASSIGN: "assign",
  REJECT: "reject",
  MERGE: "merge",
  ADJUST: "adjust",
} as const;

export const TICKET_ACTION_PATH_TO_TYPE = {
  comment: "COMMENT",
  note: "NOTE",
  assign: "ASSIGN",
  reject: "REJECT",
  merge: "MERGE",
  adjust: "ADJUST",
} as const;
