import { Tenant } from "@/domain/serviceDesk";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
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
      },
    ];
  });
};

export const snakeTenantMapper: ArrayMapper<Tenant, DbTenant> = (data) => {
  return data.map((item) => ({
    tenant_id: parseInt(item.id),
    tenant_company_id: parseInt(item.companyId),
    tenant_name: item.name,
    tenant_color: item.color,
  }));
};

export const mapTenantListPayload = createListPayloadMapper(camelTenantMapper);
export const mapTenantItemPayload = createItemPayloadMapper(camelTenantMapper);
