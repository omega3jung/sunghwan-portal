export const ACTION_PATH_BY_TYPE = {
  COMMENT: "comment",
  NOTE: "note",
  ASSIGN: "assign",
  REJECT: "reject",
  MERGE: "merge",
  ADJUST: "adjust",
} as const;

export const ACTIONS = [
  "comment",
  "note",
  "assign",
  "reject",
  "merge",
  "adjust",
] as const;

export type TicketActionApiType = (typeof ACTIONS)[number];
