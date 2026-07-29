import type { TicketAction, TicketActionType } from "@/domain/serviceDesk";
import type { TicketActionCommandPayload } from "@/lib/application/contracts/serviceDesk";

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

export type TicketActionApiHandler = (
  input: TicketActionCommandInput,
) => Promise<TicketActionCommandResult>;
