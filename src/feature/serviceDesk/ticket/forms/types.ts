import { z } from "zod";

import { ticketFormSchema } from "./schema";

/** Defines the ticket form values used by this feature's client state and UI contracts. */
export type TicketFormValues = z.infer<typeof ticketFormSchema>;
