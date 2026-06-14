import { Tenant } from "@/domain/serviceDesk";
import { idToNumber } from "@/lib/api/utils/mapId";

import { DbTenant } from "./types";

type TenantWriteFields = Pick<Tenant, "companyId" | "name" | "color" | "active">;

type DbTenantWriteInput = Omit<DbTenant, "tenant_id"> & {
  tenant_id?: number | null;
};

export type CreateTenantInput = TenantWriteFields & {
  id?: string;
};

export type UpdateTenantInput = TenantWriteFields & {
  id: string;
};

export function toTenantWritePayload(
  input: CreateTenantInput | UpdateTenantInput,
): DbTenantWriteInput {
  return {
    tenant_id: idToNumber(input.id),
    tenant_company_id: Number(input.companyId),
    tenant_name: input.name,
    tenant_color: input.color,
    tenant_active: input.active,
  };
}
