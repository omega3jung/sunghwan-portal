import {
  SERVICE_DESK_KEY,
  SERVICE_DESK_TENANT_KEY,
} from "@/feature/serviceDesk/shared/keys";
import type { ServiceDeskTenantListParams } from "@/lib/application/contracts/serviceDesk";

/** Builds stable TanStack Query keys for tenant cache entries. */
export const tenantQueryKeys = {
  all: [SERVICE_DESK_KEY, SERVICE_DESK_TENANT_KEY] as const,

  lists: () => [...tenantQueryKeys.all, "list"] as const,
  list: (params: ServiceDeskTenantListParams) =>
    [...tenantQueryKeys.lists(), params] as const,
};
