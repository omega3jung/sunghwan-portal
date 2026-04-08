import {
  TicketTrackDurationFormInput,
  TicketTrackRangeFormInput,
} from "./types";

export const ticketTrackTimeRangeFormDefaultValues: TicketTrackRangeFormInput =
  {
    startAt: "",
    endAt: "",
    note: "",
  };

export const ticketTrackTimeDurationFormDefaultValues: TicketTrackDurationFormInput =
  {
    durationMinutes: undefined,
    note: "",
  };
