import type {
  TicketActionDraftFormValues,
  TicketActionPayloadValues,
} from "./types";

/** Defines stable initial values for the ticket action draft form form. */
export const ticketActionDraftFormDefaultValues: TicketActionDraftFormValues = {
  actionType: "COMMENT",
  content: "",
  attachment: [],
  assigneeUsernames: [],
  categoryId: "",
  targetTicketId: "",
  priority: "",
  riskLevel: "",
  dueAt: undefined,
};

/** Defines stable initial values for the ticket action form form. */
export const ticketActionFormDefaultValues: TicketActionPayloadValues = {
  id: "",
  actionType: "COMMENT",
  content: "",
  files: [],
  images: [],
};
