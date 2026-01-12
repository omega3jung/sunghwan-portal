import {
  IT_SERVICE_DESK_CATEGORY_KEY,
  IT_SERVICE_DESK_KEY,
} from "@/feature/it-service-desk/keys";
import { DbParams } from "@/types";

export const categoryQueryKeys = {
  all: [IT_SERVICE_DESK_KEY, IT_SERVICE_DESK_CATEGORY_KEY] as const,
  list: (params: DbParams) =>
    [...categoryQueryKeys.all, "list", params] as const,
};
