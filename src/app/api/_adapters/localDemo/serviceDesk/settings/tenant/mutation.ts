import { getLocalDemoTenants } from "@/app/api/_adapters/localDemo/serviceDesk/settings/state";
import { ApiError } from "@/lib/application/api";
import type { DbTenant } from "@/lib/application/contracts/serviceDesk";
import type {
  CreateTenantInput,
  UpdateTenantInput,
} from "@/lib/application/contracts/serviceDesk";

import {
  createTenantIdAssigner,
  findTenantIndexById,
  normalizeTenant,
  sortTenants,
  syncTenantAcrossSettings,
} from "./tenantUtils";

const toDbTenant = ({
  id,
  companyId,
  name,
  color,
  active,
}: CreateTenantInput | UpdateTenantInput): DbTenant => ({
  tenant_id: Number(id),
  tenant_company_id: Number(companyId),
  tenant_name: name,
  tenant_color: color,
  tenant_active: active,
});

export const localCreateTenant = ({
  input,
}: {
  input: CreateTenantInput;
}) => {
  const items = getLocalDemoTenants();
  const duplicateTenantIndex = items.findIndex(
    (tenant) =>
      String(tenant.tenant_company_id) === input.companyId,
  );

  if (duplicateTenantIndex >= 0) {
    throw new ApiError(
      "serviceDesk.tenants.localDemo.companyAlreadyAssigned",
      409,
      { companyId: input.companyId },
    );
  }

  const assignId = createTenantIdAssigner(items);
  const nextTenant = toDbTenant({
    ...input,
    id: String(assignId(input.id)),
    active: input.active ?? true,
  });

  items.push(nextTenant);
  sortTenants(items);
  syncTenantAcrossSettings(nextTenant);

  return normalizeTenant(nextTenant);
};

export const localUpdateTenant = ({
  id,
  input,
}: {
  id: string;
  input: UpdateTenantInput;
}) => {
  const items = getLocalDemoTenants();
  const tenantIndex = findTenantIndexById(items, id);

  if (tenantIndex < 0) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  const duplicateTenantIndex = items.findIndex(
    (tenant) =>
      String(tenant.tenant_company_id) === input.companyId &&
      String(tenant.tenant_id) !== id &&
      tenant.tenant_active !== false,
  );

  if (duplicateTenantIndex >= 0) {
    throw new ApiError(
      "serviceDesk.tenants.localDemo.companyAlreadyAssigned",
      409,
      { companyId: input.companyId },
    );
  }

  const targetTenant = items[tenantIndex];

  if (String(targetTenant.tenant_company_id) !== input.companyId) {
    throw new ApiError(
      "serviceDesk.tenants.localDemo.companyMismatch",
      400,
      { companyId: input.companyId },
    );
  }

  const nextTenant = toDbTenant({
    ...input,
    id,
    active: input.active ?? true,
  });

  items.splice(tenantIndex, 1, nextTenant);
  sortTenants(items);
  syncTenantAcrossSettings(nextTenant);

  return normalizeTenant(nextTenant);
};

export const localSoftDeleteTenant = ({ id }: { id: string }) => {
  const items = getLocalDemoTenants();
  const tenantIndex = findTenantIndexById(items, id);

  if (tenantIndex < 0 || items[tenantIndex].tenant_active === false) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  const nextTenant: DbTenant = {
    ...items[tenantIndex],
    tenant_active: false,
  };

  items.splice(tenantIndex, 1, nextTenant);
  syncTenantAcrossSettings(nextTenant);

  return normalizeTenant(nextTenant);
};
