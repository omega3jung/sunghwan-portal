import type { TicketStatus } from "@/domain/serviceDesk";
import type {
  DbTicketDetail,
  DbTicketHistory,
  TicketActionCommandPayload,
  TicketActionPath,
} from "@/lib/application/contracts/serviceDesk";

export type TicketActionApiType = TicketActionPath;

type LocalActionBaseContext = {
  ticketId: string;
  employeeUserName: string;
  content: TicketActionCommandPayload;
};

type LocalActionMutationContext = LocalActionBaseContext & {
  actionNo: number;
  createdAt: string;
};

export type LocalActionRuntimeContext = LocalActionMutationContext & {
  action: TicketActionApiType;
  isAdmin?: boolean;
  isInternal?: boolean;
  historyNoOffset?: number;
  ticket?: DbTicketDetail;
  nextStatus?: TicketStatus;
};

export type LocalActionHistory = Omit<
  DbTicketHistory,
  | "ticket_id"
  | "history_no"
  | "source"
  | "actor_username"
  | "action_no"
  | "created_at"
> & {
  source?: DbTicketHistory["source"];
};

export type LocalActionEffect = {
  history: LocalActionHistory | LocalActionHistory[];
  ticketPatch?: Partial<DbTicketDetail>;
};

export type ExecutedLocalAction = {
  histories: DbTicketHistory[];
  updatedTicket?: DbTicketDetail;
};

export type LocalActionHandler = (
  context: LocalActionRuntimeContext,
) => LocalActionEffect | Promise<LocalActionEffect>;

export type LocalActionSpec = {
  handler: LocalActionHandler;
  needsTicket?: boolean;
};

export type DbTicketActionLocalContext = LocalActionBaseContext & {
  action: TicketActionApiType;
  isAdmin?: boolean;
  isInternal?: boolean;
};
