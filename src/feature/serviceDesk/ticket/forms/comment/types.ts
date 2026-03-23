import z from "zod";

import { commentFormSchema } from "./schema";

export type CommentFormValues = z.infer<typeof commentFormSchema>;
