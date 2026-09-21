import { z } from "zod";

import { ticketFormSchema } from "@/feature/serviceDesk/ticket/forms";
import { persistedTicketContentSchema } from "@/lib/application/contracts/serviceDesk/ticketContent";
import { hasTicketDraftCategory } from "@/lib/application/serviceDesk/ticketDraft";

export const ticketDraftFormSchema = ticketFormSchema
  .omit({ dueAt: true })
  .extend({
    dueAt: z.coerce.date<Date | string>(),
    body: persistedTicketContentSchema,
  })
  .refine((draft) => hasTicketDraftCategory(draft.category), {
    path: ["category"],
    message: "Select a category to save this draft.",
  });
