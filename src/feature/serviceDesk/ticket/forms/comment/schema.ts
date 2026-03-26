import { z } from "zod";

export const ticketCommentFormSchema = z.object({
  id: z.string(),
  body: z
    .string()
    .trim()
    .min(1, "Comment is required")
    .max(2000, "Comment must be less than 2000 characters"),

  visibility: z.enum(["public", "internal"]),

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
