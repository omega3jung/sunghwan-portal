import {
  SERVICE_DESK_KEY,
  SERVICE_DESK_TENANT_KEY,
} from "@/feature/serviceDesk/shared/keys";

import type { ServiceDeskTenantListParams } from "./types";

export const tenantQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_TENANT_KEY] as const,

  lists: () => [...tenantQueryKeys.all, "list"] as const,
  list: (params: ServiceDeskTenantListParams) =>
    [...tenantQueryKeys.lists(), params] as const,
};
