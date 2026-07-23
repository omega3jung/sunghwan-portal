import {
  toNullableRowIsoDateString,
  toRowIsoDateString,
} from "@/server/data/serviceDesk/shared";

import type { WorkSessionDto } from "./workSessionDto";
import type { WorkSessionRow } from "./workSessionRow";

export function mapWorkSessionRowToDto(
  row: WorkSessionRow,
): WorkSessionDto {
  return {
    ticket_id: row.ws_ticket_id,
    work_session_no: row.ws_id,
    assignee_username: row.ws_assignee_username,
    start_at: toNullableRowIsoDateString(row.ws_start_at),
    end_at: toNullableRowIsoDateString(row.ws_end_at),
    duration_minutes: row.ws_duration_minutes,
    note: row.ws_note,
    created_at: toRowIsoDateString(row.ws_created_at),
    updated_at: toNullableRowIsoDateString(row.ws_updated_at),
  };
}
