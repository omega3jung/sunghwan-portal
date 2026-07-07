import {
  SERVICE_DESK_CATEGORY_KEY,
  SERVICE_DESK_KEY,
} from "@/feature/serviceDesk/shared/keys";

import type { ServiceDeskCategoryListParams } from "./types";

export const categoryQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_CATEGORY_KEY] as const,

  lists: () => [...categoryQueryKeys.all, "list"] as const,
  list: (params?: ServiceDeskCategoryListParams) =>
    [...categoryQueryKeys.lists(), params] as const,
};
