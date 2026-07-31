import {
  TicketTrackDurationFormInput,
  TicketTrackRangeFormInput,
} from "./types";

/** Defines stable initial values for the ticket work session range form form. */
export const ticketWorkSessionRangeFormDefaultValues: TicketTrackRangeFormInput =
  {
    startAt: "",
    endAt: "",
    note: "",
  };

/** Defines stable initial values for the ticket work session duration form form. */
export const ticketWorkSessionDurationFormDefaultValues: TicketTrackDurationFormInput =
  {
    durationMinutes: undefined,
    note: "",
  };
