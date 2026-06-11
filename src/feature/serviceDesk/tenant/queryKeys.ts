import {
  SERVICE_DESK_KEY,
  SERVICE_DESK_TENANT_KEY,
} from "@/feature/serviceDesk/shared/keys";
import { DbParams } from "@/shared/types/api";

export const tenantQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_TENANT_KEY] as const,

  lists: () => [...tenantQueryKeys.all, "list"] as const,
  list: (params: DbParams) => [...tenantQueryKeys.lists(), params] as const,
};
