import type { z } from "zod";

import type { TicketAction, TicketActionType } from "@/domain/serviceDesk";

import { ticketActionPayloadSchema } from "./forms/schema";

export type TicketActionFormValues = z.infer<typeof ticketActionPayloadSchema>;

export type TicketActionMode =
  | "comment"
  | "note"
  | "assign"
  | "assignManager"
  | "adjust"
  | "adjustManager"
  | "merge"
  | "mergeManager"
  | "reject"
  | "rejectManager"
  | "reportResolved"
  | "reviewRejected"
  | "assignMyself";

export type TicketActionUIState = "idle" | TicketActionMode;

export type TicketActionFormMode = Exclude<TicketActionMode, "idle">;

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
