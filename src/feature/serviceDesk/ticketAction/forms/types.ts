import { z } from "zod";

import {
  ticketActionDraftFormSchema,
  ticketActionPayloadSchema,
} from "./schema";

export type TicketActionDraftFormValues = z.infer<
  typeof ticketActionDraftFormSchema
>;
export type TicketActionPayloadValues = z.infer<
  typeof ticketActionPayloadSchema
>;
export type TicketActionFormValues = TicketActionPayloadValues;

type TicketActionDraftBase = Pick<
  TicketActionDraftFormValues,
  "content" | "attachment"
>;

export type TicketApproveDraftValues = TicketActionDraftBase & {
  actionType: "APPROVE";
};

export type TicketDeclineDraftValues = TicketActionDraftBase & {
  actionType: "DECLINE";
};

export type TicketCommentDraftValues = TicketActionDraftBase & {
  actionType: "COMMENT";
};

export type TicketNoteDraftValues = TicketActionDraftBase & {
  actionType: "NOTE";
};

export type TicketAssignDraftValues = TicketActionDraftBase & {
  actionType: "ASSIGN";
  assigneeUsernames: string[];
  categoryId: string;
};

export type TicketAssignSelfDraftValues = TicketActionDraftBase & {
  actionType: "ASSIGN_SELF";
};

export type TicketRejectDraftValues = TicketActionDraftBase & {
  actionType: "REJECT";
};

export type TicketMergeDraftValues = TicketActionDraftBase & {
  actionType: "MERGE";
  targetTicketId: string;
};

export type TicketAdjustDraftValues = TicketActionDraftBase & {
  actionType: "ADJUST";
  priority: string;
  riskLevel: string;
  dueAt?: Date;
};

export type TicketReopenDraftValues = TicketActionDraftBase & {
  actionType: "REOPEN";
};

export type TicketResubmitDraftValues = TicketActionDraftBase & {
  actionType: "RESUBMIT";
};

export interface TicketActionInput {
  ticketId: string;
  actionNo?: string;
  values: TicketActionPayloadValues;
}
