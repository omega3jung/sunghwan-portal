import { ISODateString } from "@/shared/types/date";

/**
 * `workSessionNo` is ticket-scoped, so sessions are identified by ticket and
 * work-session number together.
 */
export interface TicketWorkSession {
  ticketId: string;
  workSessionNo: number;

  assigneeUsername: string;

  startAt: ISODateString | null;
  endAt: ISODateString | null;

  durationMinutes: number | null;

  note?: string;

  createdAt: ISODateString;
  updatedAt?: ISODateString;
}
