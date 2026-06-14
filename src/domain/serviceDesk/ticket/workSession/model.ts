import { ISODateString } from "@/shared/types/date";

/**
 * Ticket assignee work time tracking entry.
 *
 * workSessionNo is ticket-scoped, not globally unique.
 * Recommended identity: (ticketId, workSessionNo)
 */
export interface TicketWorkSession {
  ticketId: string;
  workSessionNo: number;

  assigneeUsername: string;

  startAt: ISODateString;
  endAt: ISODateString | null;

  durationMinutes: number | null;

  note?: string;

  createdAt: ISODateString;
  updatedAt?: ISODateString;
}
