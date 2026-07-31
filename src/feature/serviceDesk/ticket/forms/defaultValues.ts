import { TicketFormValues } from "./types";

/** Defines stable initial values for the ticket form form. */
export const ticketFormDefaultValues: TicketFormValues = {
  id: null,
  category: undefined,
  subject: "",
  body: "",
  dueAt: new Date(),
  priority: "Medium",
  riskLevel: "Medium",
  email: {
    to: [],
    cc: [],
    bcc: [],
  },
  requester: { id: "", email: "", name: "" },
  attachment: [],
};
