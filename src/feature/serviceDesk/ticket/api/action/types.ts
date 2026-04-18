import type { z } from "zod";

import type { TicketAction, TicketActionType } from "@/domain/serviceDesk";

import { ticketActionPayloadSchema } from "../../forms/action";

export type TicketActionFormValues = z.infer<typeof ticketActionPayloadSchema>;

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
