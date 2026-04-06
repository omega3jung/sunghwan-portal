import type { TicketHistory } from "@/domain/serviceDesk";

/**
 * Temporary fallback:
 * remove this after real history query is connected.
 */
export const mockHistoryItems: TicketHistory[] = [
  {
    ticketId: "demo-ticket",
    historyNo: "1",
    type: "SYSTEM",
    action: "CREATED",
    actorId: null,
    commentNo: null,
    createdAt: "2026-01-01T09:00:00.000Z",
  },
];
