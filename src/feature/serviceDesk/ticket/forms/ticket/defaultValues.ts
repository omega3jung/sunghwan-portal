import { TicketFormValues } from "./types";

export const ticketFormDefaultValues: TicketFormValues = {
  id: null,
  mainCategory: undefined,
  subCategory: undefined,
  subject: "",
  body: "",
  dueDate: new Date(),
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
