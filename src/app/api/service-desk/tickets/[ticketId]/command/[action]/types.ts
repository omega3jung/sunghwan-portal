import { DbTicketDetail } from "@/api/serviceDesk/ticket";
import { DbTicketHistory } from "@/api/serviceDesk/ticket/history";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticket/forms/action";

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

export type LocalActionRuntimeContext = {
  ticketId: string;
  userId: string;
  content: TicketActionFormValues;
  actionNo: number;
  createdAt: string;
  isInternal?: boolean;
  ticket?: DbTicketDetail;
};

export type LocalActionHistory = Omit<
  DbTicketHistory,
  "ticket_id" | "history_no" | "actor_id" | "action_no" | "created_at"
>;

export type LocalActionEffect = {
  history: LocalActionHistory;
  ticketPatch?: Partial<DbTicketDetail>;
};

export type ExecutedLocalAction = {
  history: DbTicketHistory;
  updatedTicket?: DbTicketDetail;
};

export type LocalActionHandler = (
  context: LocalActionRuntimeContext,
) => LocalActionEffect;

export type LocalActionSpec = {
  handler: LocalActionHandler;
  needsTicket?: boolean;
};

export type DbTicketActionLocalContext = {
  ticketId: string;
  userId: string;
  action: TicketActionApiType;
  content: TicketActionFormValues;
  isInternal?: boolean;
};
