import type { Attach, TicketActionType } from "@/domain/serviceDesk";
import type { ISODateString } from "@/shared/types";

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
    created_at: toIsoDateString(row.tka_created_at),
    updated_at: toNullableIsoDateString(row.tka_updated_at),
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

function toNullableIsoDateString(
  value: ISODateString | Date | null,
): ISODateString | null {
  return value === null ? null : toIsoDateString(value);
}

function toIsoDateString(value: ISODateString | Date): ISODateString {
  return (value instanceof Date ? value.toISOString() : value) as ISODateString;
}
