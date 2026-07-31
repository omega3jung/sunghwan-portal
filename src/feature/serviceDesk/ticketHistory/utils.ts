import type { TicketHistory } from "@/domain/serviceDesk";

export { mapTicketHistoryDisplayMetadata } from "@/lib/application/serviceDesk";

/** Formats history meta for presentation without changing the source model. */
export function formatHistoryMeta(history: TicketHistory) {
  return new Date(history.createdAt).toLocaleString();
}
