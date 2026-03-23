import * as z from "zod";

export const commentFormSchema = z.object({
  comment: z.string(),
  visibility: z.enum(["public", "internal"]),
});
