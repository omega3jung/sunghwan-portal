import { DataScope } from "@/domain/auth";
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

  drafts: () => [...ticketQueryKeys.all, "draft"] as const,
  draft: ({
    userId,
    dataScope,
  }: {
    userId: string | null;
    dataScope: DataScope;
  }) => [...ticketQueryKeys.drafts(), dataScope, userId] as const,
};
