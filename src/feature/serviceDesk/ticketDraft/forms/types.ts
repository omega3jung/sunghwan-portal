import { z } from "zod";

import { ticketDraftFormSchema } from "./schema";

export type TicketDraftFormValues = z.infer<typeof ticketDraftFormSchema>;
