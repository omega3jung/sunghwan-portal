import { z } from "zod";

import { ticketDraftFormSchema } from "./schema";

/** Defines the ticket draft form values used by this feature's client state and UI contracts. */
export type TicketDraftFormValues = z.infer<typeof ticketDraftFormSchema>;
