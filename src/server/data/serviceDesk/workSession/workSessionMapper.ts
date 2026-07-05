import type { ISODateString } from "@/shared/types";

import type { WorkSessionDto } from "./workSessionDto";
import type { WorkSessionRow } from "./workSessionRow";

export function mapWorkSessionRowToDto(
  row: WorkSessionRow,
): WorkSessionDto {
  return {
    ticket_id: row.ws_ticket_id,
    work_session_no: row.ws_id,
    assignee_username: row.ws_assignee_username,
    start_at: toNullableIsoDateString(row.ws_start_at),
    end_at: toNullableIsoDateString(row.ws_end_at),
    duration_minutes: row.ws_duration_minutes,
    note: row.ws_note,
    created_at: toIsoDateString(row.ws_created_at),
    updated_at: toNullableIsoDateString(row.ws_updated_at),
  };
}

function toNullableIsoDateString(
  value: ISODateString | Date | null,
): ISODateString | null {
  return value === null ? null : toIsoDateString(value);
}

function toIsoDateString(value: ISODateString | Date): ISODateString {
  return (value instanceof Date ? value.toISOString() : value) as ISODateString;
}
