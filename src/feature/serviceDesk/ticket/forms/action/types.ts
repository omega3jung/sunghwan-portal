import { z } from "zod";

import { ticketActionFormSchema } from "./schema";

export type TicketActionFormValues = z.infer<typeof ticketActionFormSchema>;

export interface TicketActionInput {
  ticketId: string;
  actionNo?: string;
  values: TicketActionFormValues;
}
