import {
  SERVICE_DESK_CATEGORY_KEY,
  SERVICE_DESK_KEY,
} from "@/feature/serviceDesk/keys";
import { DbParams } from "@/shared/types/api";

export const categoryQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_CATEGORY_KEY] as const,
  list: (params: DbParams) =>
    [...categoryQueryKeys.all, "list", JSON.stringify(params)] as const,
};
