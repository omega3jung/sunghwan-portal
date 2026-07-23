import type { Attach, TicketActionType } from "@/domain/serviceDesk";
import {
  toNullableRowIsoDateString,
  toRowIsoDateString,
} from "@/server/data/serviceDesk/shared";

import type { TicketActionDto } from "./ticketActionDto";
import type { TicketActionRow } from "./ticketActionRow";

export function mapTicketActionRowToDto(
  row: TicketActionRow,
): TicketActionDto {
  return {
    ticket_id: row.tka_ticket_id,
    action_no: row.tka_action_no,
    action_type: row.tka_action_type as TicketActionType,
    content: row.tka_content ?? "",
    metadata: normalizeMetadata(row.tka_metadata),
    owner_username: row.tka_owner_username,
    owner_name: row.tka_owner_name ?? null,
    created_at: toRowIsoDateString(row.tka_created_at),
    updated_at: toNullableRowIsoDateString(row.tka_updated_at),
    active: row.tka_active,
    files: normalizeJsonArray<Attach>(row.tka_files),
    images: normalizeJsonArray<Attach>(row.tka_images),
  };
}

function normalizeJsonArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
