import z from "zod";

import { ticketSearchCriteriaFormSchema } from "./schema";

export type TicketSearchCriteriaFormValues = z.infer<
  typeof ticketSearchCriteriaFormSchema
>;
