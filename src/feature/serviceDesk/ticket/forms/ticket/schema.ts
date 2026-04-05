import { z } from "zod";

export const ticketFormSchema = z.object({
  id: z.string().nullable(),
  mainCategory: z.string().optional(),
  subCategory: z.string().optional(),
  subject: z.string().max(200),
  body: z.string(),
  dueDate: z.date(),
  priority: z.string().nullable(),
  riskLevel: z.string().nullable(),
  email: z.object({
    to: z.string().array(),
    cc: z.string().array(),
    bcc: z.string().array(),
  }),
  requester: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
  attachment: z.file().array(),
});
