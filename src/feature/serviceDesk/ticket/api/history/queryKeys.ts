import {
  SERVICE_DESK_KEY,
  SERVICE_DESK_TICKET_KEY,
} from "@/feature/serviceDesk/keys";

const SERVICE_DESK_TICKET_HISTORY_KEY = "history";

export const ticketHistoryQueryKeys = {
  all: [
    SERVICE_DESK_KEY,
    SERVICE_DESK_TICKET_KEY,
    SERVICE_DESK_TICKET_HISTORY_KEY,
  ] as const,

  lists: () => [...ticketHistoryQueryKeys.all, "list"] as const,
  list: (ticketId: string) =>
    [...ticketHistoryQueryKeys.lists(), ticketId] as const,
};
