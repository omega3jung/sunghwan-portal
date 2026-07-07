import type { TicketHistory } from "@/domain/serviceDesk";

export { mapTicketHistoryDisplayMetadata } from "@/domain/serviceDesk";

export function formatHistoryMeta(history: TicketHistory) {
  return new Date(history.createdAt).toLocaleString();
}
