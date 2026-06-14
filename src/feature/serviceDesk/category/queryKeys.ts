import {
  SERVICE_DESK_CATEGORY_KEY,
  SERVICE_DESK_KEY,
} from "@/feature/serviceDesk/shared/keys";
import { DbParams } from "@/shared/types/api";

export const categoryQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_CATEGORY_KEY] as const,

  lists: () => [...categoryQueryKeys.all, "list"] as const,
  list: (params: DbParams) => [...categoryQueryKeys.lists(), params] as const,
};
