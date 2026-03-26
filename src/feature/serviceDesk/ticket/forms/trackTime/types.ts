import { z } from "zod";

import {
  ticketTrackDurationFormSchema,
  ticketTrackRangeFormSchema,
} from "./schema";

export type TicketTrackRangeFormValues = z.infer<
  typeof ticketTrackRangeFormSchema
>;

export type TicketTrackDurationFormValues = z.infer<
  typeof ticketTrackDurationFormSchema
>;
