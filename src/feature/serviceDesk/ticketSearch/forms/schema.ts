import * as z from "zod";

import type { TicketStatusFilterValue } from "../statusFilter";

const ticketStatusFilterValueSchema = z.custom<TicketStatusFilterValue>(
  (value) => typeof value === "string",
);

export const ticketSearchCriteriaFormSchema = z.object({
  cat_scope: z.enum(["INTERNAL", "PORTAL"]).optional(),
  category: z.string().array(),
  status: ticketStatusFilterValueSchema.array(),
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
