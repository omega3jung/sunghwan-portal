import { ISODateString } from "@/shared/types/date";

/**
 * Ticket time tracking entry.
 *
 * trackTimeNo is ticket-scoped, not globally unique.
 * Recommended identity: (ticketId, trackTimeNo)
 */
export interface TicketTrackTime {
  ticketId: string;
  trackTimeNo: number;

  assigneeId: string;

  startAt: ISODateString;
  endAt: ISODateString | null;

  durationMinutes: number | null;

  note?: string;

  createdAt: ISODateString;
  updatedAt?: ISODateString;
}
