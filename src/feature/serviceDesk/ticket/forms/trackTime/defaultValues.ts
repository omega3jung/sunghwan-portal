import {
  TicketTrackDurationFormValues,
  TicketTrackRangeFormValues,
} from "./types";

export const ticketTrackTimeRangeFormDefaultValues: TicketTrackRangeFormValues =
  {
    startAt: "",
    endAt: "",
    note: "",
  };

export const ticketTrackTimeDurationFormDefaultValues: TicketTrackDurationFormValues =
  {
    durationMinutes: undefined,
    note: "",
  };
