import {
  IT_SERVICE_DESK_CATEGORY_KEY,
  IT_SERVICE_DESK_KEY,
} from "@/feature/itServiceDesk/keys";
import { DbParams } from "@/shared/types/api";

export const categoryQueryKeys = {
  all: [IT_SERVICE_DESK_KEY, IT_SERVICE_DESK_CATEGORY_KEY] as const,
  list: (params: DbParams) =>
    [...categoryQueryKeys.all, "list", JSON.stringify(params)] as const,
};
