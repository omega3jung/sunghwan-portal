import { z } from "zod";

import {
  ticketTrackDurationFormSchema,
  ticketTrackRangeFormSchema,
} from "./schema";

export type TicketTrackRangeFormValues = z.infer<
  typeof ticketTrackRangeFormSchema
>;
export type TicketTrackRangeFormInput = z.input<
  typeof ticketTrackRangeFormSchema
>;

export type TicketTrackDurationFormValues = z.infer<
  typeof ticketTrackDurationFormSchema
>;
export type TicketTrackDurationFormInput = z.input<
  typeof ticketTrackDurationFormSchema
>;
