import { z } from "zod";

import { ticketFormSchema } from "@/feature/serviceDesk/ticket/forms";

/** Validates and normalizes ticket draft form values before they leave the client feature boundary. */
export const ticketDraftFormSchema = ticketFormSchema
  .omit({ dueAt: true })
  .extend({ dueAt: z.coerce.date<Date | string>() });
