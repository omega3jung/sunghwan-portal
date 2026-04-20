import { DbTicketDetail } from "@/api/serviceDesk/ticket";
import { DbTicketHistory } from "@/api/serviceDesk/ticket/history";
import type { TicketStatus } from "@/domain/serviceDesk";
import {
  TICKET_ACTION_PATHS,
  TICKET_ACTION_TYPE_TO_PATH,
  type TicketActionPath,
} from "@/feature/serviceDesk/ticket/action/constants";
import { TicketActionFormValues } from "@/feature/serviceDesk/ticket/action/forms";
import type { TicketActionMode as FeatureTicketActionMode } from "@/feature/serviceDesk/ticket/action/types";

export const ACTION_PATH_BY_TYPE = TICKET_ACTION_TYPE_TO_PATH;

export const ACTIONS = TICKET_ACTION_PATHS;

export type TicketActionApiType = TicketActionPath;

export const EXECUTABLE_TICKET_ACTION_MODES = [
  ...TICKET_ACTION_PATHS,
  "assignManager",
  "adjustManager",
  "mergeManager",
  "rejectManager",
] as const satisfies readonly FeatureTicketActionMode[];

export type TicketActionExecutionMode =
  (typeof EXECUTABLE_TICKET_ACTION_MODES)[number];

type LocalActionBaseContext = {
  ticketId: string;
  userId: string;
  content: TicketActionFormValues;
};

type LocalActionMutationContext = LocalActionBaseContext & {
  actionNo: number;
  createdAt: string;
};

export type LocalActionRuntimeContext = LocalActionMutationContext & {
  action: TicketActionApiType;
  actionMode: TicketActionExecutionMode;
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
  actionMode: TicketActionExecutionMode;
  isInternal?: boolean;
};
