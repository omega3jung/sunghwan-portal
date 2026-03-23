export const ticketFormDefaultValues = {
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
