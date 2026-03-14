import * as z from "zod";

export const TicketFilterFormSchema = z.object({
  category: z.string().array,
  status: z.string().array,
  assignee: z.string().array,
  requester: z.string().array,
  period: {
    type: z.string(),
    from: z.date(),
    to: z.date(),
  },
  dueBy: {
    type: z.string(),
    from: z.date(),
    to: z.date(),
  },
  priority: z.string().array,
  keyword: z.string(),
});

export type TicketFilterFormType = z.infer<typeof TicketFilterFormSchema>;
