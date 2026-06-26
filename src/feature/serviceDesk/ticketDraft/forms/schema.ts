import { z } from "zod";

import { ticketFormSchema } from "@/feature/serviceDesk/ticket/forms";

export const ticketDraftFormSchema = ticketFormSchema
  .omit({ dueAt: true })
  .extend({ dueAt: z.coerce.date<Date | string>() });
