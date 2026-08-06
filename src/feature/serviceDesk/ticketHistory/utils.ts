import type { TicketHistory } from "@/domain/serviceDesk";

export { mapTicketHistoryDisplayMetadata } from "@/lib/application/serviceDesk";

/** Formats presentation metadata without mutating or reinterpreting the source record. */
export function formatHistoryMeta(history: TicketHistory) {
  return new Date(history.createdAt).toLocaleString();
}
