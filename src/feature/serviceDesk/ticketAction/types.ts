import type { TicketAction, TicketActionType } from "@/domain/serviceDesk";
import type { TicketActionCommandPayload } from "@/lib/application/contracts/serviceDesk";

/** Action dialogs and commands supported by the ticket UI. */
export type TicketActionMode =
  | "approve"
  | "decline"
  | "comment"
  | "note"
  | "assign"
  | "assignSelf"
  | "adjust"
  | "merge"
  | "reject"
  | "reopen"
  | "resubmit"
  | "cancel";

/** `idle` closes the action surface; every other value selects one action draft. */
export type TicketActionUIState = "idle" | TicketActionMode;

export interface TicketActionCommandInput {
  ticketId: string;
  actionType: TicketActionType;
  values: TicketActionCommandPayload;
}

export interface TicketActionDeleteInput {
  ticketId: string;
  actionNo: string;
}

export type TicketActionCommandResult = TicketAction;

/** Async handler signature shared by ticket-action submissions. */
export type TicketActionApiHandler = (
  input: TicketActionCommandInput,
) => Promise<TicketActionCommandResult>;
