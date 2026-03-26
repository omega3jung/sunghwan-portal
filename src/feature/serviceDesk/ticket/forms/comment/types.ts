import { z } from "zod";

import { ticketCommentFormSchema } from "./schema";

export type TicketCommentFormValues = z.infer<typeof ticketCommentFormSchema>;

export interface TicketCommentInput {
  ticketId: string;
  commentNo?: string; // required for update
  values: TicketCommentFormValues;
}
