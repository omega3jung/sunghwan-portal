import { z } from "zod";

import { ticketFormSchema } from "./schema";

export type TicketFormValues = z.infer<typeof ticketFormSchema>;
