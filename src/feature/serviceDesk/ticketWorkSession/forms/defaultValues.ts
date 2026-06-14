import {
  TicketTrackDurationFormInput,
  TicketTrackRangeFormInput,
} from "./types";

export const ticketWorkSessionRangeFormDefaultValues: TicketTrackRangeFormInput =
  {
    startAt: "",
    endAt: "",
    note: "",
  };

export const ticketWorkSessionDurationFormDefaultValues: TicketTrackDurationFormInput =
  {
    durationMinutes: undefined,
    note: "",
  };
