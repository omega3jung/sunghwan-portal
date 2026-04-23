import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/api/utils/payload";
import { TicketTrackTime } from "@/domain/serviceDesk";
import { ArrayMapper } from "@/shared/types";
import { ISODateString } from "@/shared/types/date";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/nullable";

export interface DbTicketTrackTime {
  ticket_id: string;
  track_time_no: number;
  assignee_id: string;

  start_at: ISODateString;
  end_at: ISODateString | null;

  duration_minutes: number | null;
  note: string | null;

  created_at: ISODateString;
  updated_at: ISODateString | null;
}

export const camelTicketTrackTimeMapper: ArrayMapper<
  DbTicketTrackTime,
  TicketTrackTime
> = (data) => {
  return data.map((item) => ({
    ticketId: item.ticket_id,
    trackTimeNo: item.track_time_no,
    assigneeId: item.assignee_id,
    startAt: item.start_at,
    endAt: item.end_at,
    durationMinutes: item.duration_minutes,
    note: nullToUndefined(item.note),
    createdAt: item.created_at,
    updatedAt: nullToUndefined(item.updated_at),
  }));
};

export const snakeTicketTrackTimeMapper: ArrayMapper<
  TicketTrackTime,
  DbTicketTrackTime
> = (data) => {
  return data.map((item) => ({
    ticket_id: item.ticketId,
    track_time_no: item.trackTimeNo,
    assignee_id: item.assigneeId,
    start_at: item.startAt,
    end_at: item.endAt,
    duration_minutes: item.durationMinutes,
    note: undefinedToNull(item.note),
    created_at: item.createdAt,
    updated_at: undefinedToNull(item.updatedAt),
  }));
};

export const mapTicketTrackTimeListPayload = createListPayloadMapper(
  camelTicketTrackTimeMapper,
);
export const mapTicketTrackTimePayload = createItemPayloadMapper(
  camelTicketTrackTimeMapper,
);
