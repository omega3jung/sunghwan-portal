import type { TicketStatus } from "@/domain/serviceDesk";
import type {
  DbTicketDetail,
  DbTicketHistory,
  TicketActionCommandPayload,
  TicketActionPath,
} from "@/lib/application/contracts/serviceDesk";

/** Describes ticket action API type used by the server-side LOCAL ticket adapter. */
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

/** Describes local action runtime context used by the server-side LOCAL ticket adapter. */
export type LocalActionRuntimeContext = LocalActionMutationContext & {
  action: TicketActionApiType;
  isAdmin?: boolean;
  isInternal?: boolean;
  historyNoOffset?: number;
  ticket?: DbTicketDetail;
  nextStatus?: TicketStatus;
};

/** Describes local action history used by the server-side LOCAL ticket adapter. */
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

/** Describes local action effect used by the server-side LOCAL ticket adapter. */
export type LocalActionEffect = {
  history: LocalActionHistory | LocalActionHistory[];
  ticketPatch?: Partial<DbTicketDetail>;
};

/** Describes executed local action used by the server-side LOCAL ticket adapter. */
export type ExecutedLocalAction = {
  histories: DbTicketHistory[];
  updatedTicket?: DbTicketDetail;
};

/** Describes local action handler used by the server-side LOCAL ticket adapter. */
export type LocalActionHandler = (
  context: LocalActionRuntimeContext,
) => LocalActionEffect | Promise<LocalActionEffect>;

/** Describes local action spec used by the server-side LOCAL ticket adapter. */
export type LocalActionSpec = {
  handler: LocalActionHandler;
  needsTicket?: boolean;
};

/** Describes database ticket action local context used by the server-side LOCAL ticket adapter. */
export type DbTicketActionLocalContext = LocalActionBaseContext & {
  action: TicketActionApiType;
  isAdmin?: boolean;
  isInternal?: boolean;
};
