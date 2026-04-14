import { z } from "zod";

export const ticketActionFormSchema = z.object({
  id: z.string(),
  actionType: z.enum([
    "COMMENT",
    "NOTE",
    "ASSIGN",
    "REJECT",
    "MERGE",
    "ADJUST",
  ]),
  content: z
    .string()
    .trim()
    .min(1, "Action content is required")
    .max(2000, "Action content must be less than 2000 characters"),
  files: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      size: z.number(),
      url: z.string().optional(),
    }),
  ),
  images: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      size: z.number(),
      url: z.string().optional(),
    }),
  ),
});
