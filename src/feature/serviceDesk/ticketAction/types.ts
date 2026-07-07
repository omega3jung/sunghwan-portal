import type { z } from "zod";

import type { TicketAction, TicketActionType } from "@/domain/serviceDesk";

import { ticketActionPayloadSchema } from "./forms/schema";

export type TicketActionFormValues = z.infer<typeof ticketActionPayloadSchema>;

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
  values: TicketActionFormValues;
}

export interface TicketActionDeleteInput {
  ticketId: string;
  actionNo: string;
}

export type TicketActionCommandResult = TicketAction;

export type TicketActionApiHandler = (
  input: TicketActionCommandInput,
) => Promise<TicketActionCommandResult>;
