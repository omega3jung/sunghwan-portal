import { z } from "zod";

import { ticketDraftFormSchema, ticketFormSchema } from "./schema";

export type TicketFormValues = z.infer<typeof ticketFormSchema>;
export type TicketDraftFormValues = z.infer<typeof ticketDraftFormSchema>;
