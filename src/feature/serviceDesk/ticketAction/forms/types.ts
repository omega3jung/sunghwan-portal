import { z } from "zod";

import {
  ticketActionDraftFormSchema,
  ticketActionPayloadSchema,
} from "./schema";

/** Defines the ticket action draft form values used by this feature's client state and UI contracts. */
export type TicketActionDraftFormValues = z.infer<
  typeof ticketActionDraftFormSchema
>;
/** Defines the ticket action payload values accepted at this feature boundary. */
export type TicketActionPayloadValues = z.infer<
  typeof ticketActionPayloadSchema
>;

type TicketActionDraftBase = Pick<
  TicketActionDraftFormValues,
  "content" | "attachment"
>;

/** Defines the ticket approve draft values used by this feature's client state and UI contracts. */
export type TicketApproveDraftValues = TicketActionDraftBase & {
  actionType: "APPROVE";
};

/** Defines the ticket decline draft values used by this feature's client state and UI contracts. */
export type TicketDeclineDraftValues = TicketActionDraftBase & {
  actionType: "DECLINE";
};

/** Defines the ticket comment draft values used by this feature's client state and UI contracts. */
export type TicketCommentDraftValues = TicketActionDraftBase & {
  actionType: "COMMENT";
};

/** Defines the ticket note draft values used by this feature's client state and UI contracts. */
export type TicketNoteDraftValues = TicketActionDraftBase & {
  actionType: "NOTE";
};

/** Defines the ticket assign draft values used by this feature's client state and UI contracts. */
export type TicketAssignDraftValues = TicketActionDraftBase & {
  actionType: "ASSIGN";
  assigneeUsernames: string[];
  categoryId: string;
};

/** Defines the ticket assign self draft values used by this feature's client state and UI contracts. */
export type TicketAssignSelfDraftValues = TicketActionDraftBase & {
  actionType: "ASSIGN_SELF";
};

/** Defines the ticket reject draft values used by this feature's client state and UI contracts. */
export type TicketRejectDraftValues = TicketActionDraftBase & {
  actionType: "REJECT";
};

/** Defines the ticket merge draft values used by this feature's client state and UI contracts. */
export type TicketMergeDraftValues = TicketActionDraftBase & {
  actionType: "MERGE";
  targetTicketId: string;
};

/** Defines the ticket adjust draft values used by this feature's client state and UI contracts. */
export type TicketAdjustDraftValues = TicketActionDraftBase & {
  actionType: "ADJUST";
  priority: string;
  riskLevel: string;
  dueAt?: Date;
};

/** Defines the ticket reopen draft values used by this feature's client state and UI contracts. */
export type TicketReopenDraftValues = TicketActionDraftBase & {
  actionType: "REOPEN";
};

/** Defines the ticket resubmit draft values used by this feature's client state and UI contracts. */
export type TicketResubmitDraftValues = TicketActionDraftBase & {
  actionType: "RESUBMIT";
};

/** Defines the ticket cancel draft values used by this feature's client state and UI contracts. */
export type TicketCancelDraftValues = TicketActionDraftBase & {
  actionType: "CANCEL";
};

/** Defines the ticket action input accepted at this feature boundary. */
export interface TicketActionInput {
  ticketId: string;
  actionNo?: string;
  values: TicketActionPayloadValues;
}
