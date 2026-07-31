import { z } from "zod";

import { ticketSearchCriteriaFormSchema } from "./schema";

/** Defines the ticket search criteria form values used by this feature's client state and UI contracts. */
export type TicketSearchCriteriaFormValues = z.infer<
  typeof ticketSearchCriteriaFormSchema
>;
