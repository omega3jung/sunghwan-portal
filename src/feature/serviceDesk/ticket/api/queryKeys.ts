import {
  SERVICE_DESK_CATEGORY_KEY,
  SERVICE_DESK_KEY,
} from "@/feature/serviceDesk/keys";
import { DbParams } from "@/shared/types/api";

export const ticketQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_CATEGORY_KEY] as const,

  lists: () => [...ticketQueryKeys.all, "list"] as const,
  list: (params: DbParams) => [...ticketQueryKeys.lists(), params] as const,

  details: () => [...ticketQueryKeys.all, "detail"] as const,
  detail: (id: string | number) => [...ticketQueryKeys.details(), id] as const,
};
