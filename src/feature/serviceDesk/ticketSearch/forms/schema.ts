import * as z from "zod";

export const ticketSearchCriteriaFormSchema = z.object({
  category: z.string().array(),
  status: z.string().array(),
  riskLevel: z.string().array(),
  assignee: z.string().array(),
  requester: z.string().array(),
  period: z.object({
    type: z.string(),
    dateRange: z.object({
      from: z.date(),
      to: z.date(),
    }),
  }),
  dueBy: z.object({
    type: z.string(),
    dateRange: z.object({
      from: z.date(),
      to: z.date(),
    }).optional(),
  }).optional(),
  priority: z.string().array(),
  keyword: z.string(),
});
