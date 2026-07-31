import type { TicketAction, TicketActionType } from "@/domain/serviceDesk";
import type { TicketActionCommandPayload } from "@/lib/application/contracts/serviceDesk";

/** Enumerates the action dialogs and commands supported by the ticket UI. */
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

/** Tracks the currently selected action mode and target ticket in client state. */
export type TicketActionUIState = "idle" | TicketActionMode;

/** Defines the ticket action command input accepted at this feature boundary. */
export interface TicketActionCommandInput {
  ticketId: string;
  actionType: TicketActionType;
  values: TicketActionCommandPayload;
}

/** Defines the ticket action delete input accepted at this feature boundary. */
export interface TicketActionDeleteInput {
  ticketId: string;
  actionNo: string;
}

/** Defines the ticket action command result returned to this feature boundary. */
export type TicketActionCommandResult = TicketAction;

/** Defines the async handler signature shared by ticket action submissions. */
export type TicketActionApiHandler = (
  input: TicketActionCommandInput,
) => Promise<TicketActionCommandResult>;
