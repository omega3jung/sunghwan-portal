import type { TicketStatus } from "@/domain/serviceDesk";
import { DbTicketDetail } from "@/feature/serviceDesk/ticket/api";
import {
  TICKET_ACTION_TYPE_TO_PATH,
  TicketActionFormValues,
  TicketActionPath,
} from "@/feature/serviceDesk/ticketAction";
import { DbTicketHistory } from "@/feature/serviceDesk/ticketHistory";

export const ACTION_PATH_BY_TYPE = TICKET_ACTION_TYPE_TO_PATH;

export type TicketActionApiType = TicketActionPath;

export type TicketActionExecutionMode =
  | TicketActionApiType
  | "assignManager"
  | "adjustManager"
  | "mergeManager"
  | "rejectManager";

type LocalActionBaseContext = {
  ticketId: string;
  employeeUserName: string;
  content: TicketActionFormValues;
};

type LocalActionMutationContext = LocalActionBaseContext & {
  actionNo: number;
  createdAt: string;
};

export type LocalActionRuntimeContext = LocalActionMutationContext & {
  action: TicketActionApiType;
  isAdmin?: boolean;
  isInternal?: boolean;
  ticket?: DbTicketDetail;
  nextStatus?: TicketStatus;
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

export type DbTicketActionLocalContext = LocalActionBaseContext & {
  action: TicketActionApiType;
  isAdmin?: boolean;
  isInternal?: boolean;
};
