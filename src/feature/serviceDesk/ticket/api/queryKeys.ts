import {
  SERVICE_DESK_KEY,
  SERVICE_DESK_TICKET_KEY,
} from "@/feature/serviceDesk/shared/keys";
import { DbParams } from "@/shared/types/api";

import { TicketSearchRequest } from "./types";

export const ticketQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_TICKET_KEY] as const,

  lists: () => [...ticketQueryKeys.all, "list"] as const,
  list: (params: DbParams) => [...ticketQueryKeys.lists(), params] as const,

  searches: () => [...ticketQueryKeys.all, "search"] as const,
  search: (request: TicketSearchRequest) =>
    [...ticketQueryKeys.searches(), request] as const,

  details: () => [...ticketQueryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...ticketQueryKeys.details(), id] as const,
};
