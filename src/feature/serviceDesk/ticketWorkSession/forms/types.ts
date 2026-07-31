import { z } from "zod";

import {
  ticketTrackDurationFormSchema,
  ticketTrackRangeFormSchema,
} from "./schema";

/** Defines the ticket track range form values used by this feature's client state and UI contracts. */
export type TicketTrackRangeFormValues = z.infer<
  typeof ticketTrackRangeFormSchema
>;
/** Defines the ticket track range form input accepted at this feature boundary. */
export type TicketTrackRangeFormInput = z.input<
  typeof ticketTrackRangeFormSchema
>;

/** Defines the ticket track duration form values used by this feature's client state and UI contracts. */
export type TicketTrackDurationFormValues = z.infer<
  typeof ticketTrackDurationFormSchema
>;
/** Defines the ticket track duration form input accepted at this feature boundary. */
export type TicketTrackDurationFormInput = z.input<
  typeof ticketTrackDurationFormSchema
>;
