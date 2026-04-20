export const TICKET_ACTION_PATHS = [
  "comment",
  "note",
  "assign",
  "reject",
  "merge",
  "adjust",
  "reportResolved",
  "reviewRejected",
  "assignMyself",
] as const;

export type TicketActionPath = (typeof TICKET_ACTION_PATHS)[number];

export const TICKET_ACTION_TYPE_TO_PATH = {
  COMMENT: "comment",
  NOTE: "note",
  ASSIGN: "assign",
  REJECT: "reject",
  MERGE: "merge",
  ADJUST: "adjust",
  REPORT_RESOLVED: "reportResolved",
  REVIEW_REJECTED: "reviewRejected",
  ASSIGN_MYSELF: "assignMyself",
} as const;

export const TICKET_ACTION_PATH_TO_TYPE = {
  comment: "COMMENT",
  note: "NOTE",
  assign: "ASSIGN",
  reject: "REJECT",
  merge: "MERGE",
  adjust: "ADJUST",
  reportResolved: "REPORT_RESOLVED",
  reviewRejected: "REVIEW_REJECTED",
  assignMyself: "ASSIGN_MYSELF",
} as const;

export const TICKET_ACTION_FORM_MODES = [
  "comment",
  "note",
  "assign",
  "adjust",
  "merge",
  "reject",
  "reportResolved",
  "reviewRejected",
  "assignMyself",
] as const;
