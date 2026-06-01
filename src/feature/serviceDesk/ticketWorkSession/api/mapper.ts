import { TicketWorkSession } from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

export interface DbTicketWorkSession {
  ticket_id: string;
  work_session_no: number;
  assignee_id: string;

  start_at: ISODateString;
  end_at: ISODateString | null;

  duration_minutes: number | null;
  note: string | null;

  created_at: ISODateString;
  updated_at: ISODateString | null;
}

export const camelTicketWorkSessionMapper: ArrayMapper<
  DbTicketWorkSession,
  TicketWorkSession
> = (data) => {
  return data.map((item) => ({
    ticketId: item.ticket_id,
    workSessionNo: item.work_session_no,
    assigneeUsername: item.assignee_id,
    startAt: item.start_at,
    endAt: item.end_at,
    durationMinutes: item.duration_minutes,
    note: nullToUndefined(item.note),
    createdAt: item.created_at,
    updatedAt: nullToUndefined(item.updated_at),
  }));
};

export const snakeTicketWorkSessionMapper: ArrayMapper<
  TicketWorkSession,
  DbTicketWorkSession
> = (data) => {
  return data.map((item) => ({
    ticket_id: item.ticketId,
    work_session_no: item.workSessionNo,
    assignee_id: item.assigneeUsername,
    start_at: item.startAt,
    end_at: item.endAt,
    duration_minutes: item.durationMinutes,
    note: undefinedToNull(item.note),
    created_at: item.createdAt,
    updated_at: undefinedToNull(item.updatedAt),
  }));
};

export const mapTicketWorkSessionListPayload = createListPayloadMapper(
  camelTicketWorkSessionMapper,
);
export const mapTicketWorkSessionPayload = createItemPayloadMapper(
  camelTicketWorkSessionMapper,
);
