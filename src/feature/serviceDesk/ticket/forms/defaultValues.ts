import { TicketFormValues } from "./types";

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
