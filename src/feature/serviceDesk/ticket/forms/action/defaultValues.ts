import type {
  TicketActionDraftFormValues,
  TicketActionPayloadValues,
} from "./types";

export const ticketActionDraftFormDefaultValues: TicketActionDraftFormValues = {
  actionType: "COMMENT",
  content: "",
  attachment: [],
  assigneeIds: [],
  categoryId: "",
  targetTicketId: "",
  priority: "",
  riskLevel: "",
  dueAt: undefined,
};

export const ticketActionFormDefaultValues: TicketActionPayloadValues = {
  id: "",
  actionType: "COMMENT",
  content: "",
  files: [],
  images: [],
};
