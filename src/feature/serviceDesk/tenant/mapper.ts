import { Tenant } from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/application/api/payload";
import { ArrayMapper } from "@/shared/types";

import { DbTenant } from "./types";

export const camelTenantMapper: ArrayMapper<DbTenant, Tenant> = (data) => {
  return data.flatMap((item) => {
    if (!item) {
      return [];
    }

    return [
      {
        id: item.tenant_id.toString(),
        companyId: item.tenant_company_id.toString(),
        name: item.tenant_name,
        color: item.tenant_color,
        active: item.tenant_active ?? true,
      },
    ];
  });
};

export const mapTenantListPayload = createListPayloadMapper(camelTenantMapper);
export const mapTenantItemPayload = createItemPayloadMapper(camelTenantMapper);
