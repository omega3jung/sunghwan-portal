import { TicketFormValues } from "./types";

export const ticketFormDefaultValues: TicketFormValues = {
  id: null,
  category: undefined,
  subject: "",
  body: "",
  dueDate: new Date(),
  priority: "Medium",
  email: {
    to: [],
    cc: [],
    bcc: [],
  },
  requester: { id: "", email: "", name: "" },
  attachment: [],
};
