import type { DataScope } from "@/domain/auth";
import { isOwnerCompany } from "@/domain/organization";
import { ApiError } from "@/lib/application/api";
import { getPortalOwnerCompany } from "@/server/data/organization/company";

import {
  CreateTenantInputDto,
  TenantDto,
  UpdateTenantInputDto,
} from "./tenantDto";
import {
  mapCreateTenantInputDtoToRowInput,
  mapTenantRowsToDtos,
  mapTenantRowToDto,
  mapUpdateTenantInputDtoToRowInput,
} from "./tenantMapper";
import {
  createTenantRow,
  deactivateTenantRowById,
  findActiveTenantRowByCompanyId,
  findActiveTenantRowById,
  findActiveTenantRows,
  findTenantRowById,
  findTenantRows,
  updateTenantRowById,
} from "./tenantRepository";

export async function getTenantById(
  tenantId: string | number,
): Promise<TenantDto | null> {
  const row = await findTenantRowById(tenantId);

  if (!row) {
    return null;
  }

  return mapTenantRowToDto(row);
}

export async function getTenants(): Promise<TenantDto[]> {
  const rows = await findTenantRows();

  return mapTenantRowsToDtos(rows);
}

export async function getActiveTenantById(
  tenantId: string | number,
): Promise<TenantDto | null> {
  const row = await findActiveTenantRowById(tenantId);

  if (!row) {
    return null;
  }

  return mapTenantRowToDto(row);
}

export async function getActiveTenantByCompanyId(
  companyId: string | number,
): Promise<TenantDto | null> {
  const row = await findActiveTenantRowByCompanyId(companyId);

  if (!row) {
    return null;
  }

  return mapTenantRowToDto(row);
}

export async function getActiveTenants(): Promise<TenantDto[]> {
  const rows = await findActiveTenantRows();

  return mapTenantRowsToDtos(rows);
}

export type ServiceDeskSettingsTenantContext = {
  id: string;
  companyId: number;
  isOwnerTenant: boolean;
  active: boolean;
};

export async function getServiceDeskSettingsTenantContexts(
  _dataScope: DataScope,
): Promise<ServiceDeskSettingsTenantContext[]> {
  const tenants = await getTenants();

  return tenants.map((tenant) => ({
    id: String(tenant.tenant_id),
    companyId: Number(tenant.tenant_company_id),
    isOwnerTenant: isOwnerCompany(tenant.tenant_company_id),
    active: tenant.tenant_active,
  }));
}

export async function getServiceDeskSettingsTenantContext(
  dataScope: DataScope,
  tenantId: string | number,
) {
  return (
    (await getServiceDeskSettingsTenantContexts(dataScope)).find(
      (tenant) => tenant.id === String(tenantId),
    ) ?? null
  );
}

export async function getServiceDeskSettingsTenantContextByCompanyId(
  dataScope: DataScope,
  companyId: string | number,
) {
  return (
    (await getServiceDeskSettingsTenantContexts(dataScope)).find(
      (tenant) => String(tenant.companyId) === String(companyId),
    ) ?? null
  );
}

export async function getPortalOwnerCompanyId(_dataScope: DataScope) {
  return Number((await getPortalOwnerCompany()).company_id);
}

export async function createTenant(
  input: CreateTenantInputDto,
): Promise<TenantDto> {
  const rows = await findTenantRows();
  const duplicateTenant = rows.find(
    (row) => Number(row.tn_company_id) === Number(input.tenant_company_id),
  );

  if (duplicateTenant) {
    throw new ApiError(
      "serviceDesk.tenants.companyAlreadyAssigned",
      409,
      { companyId: input.tenant_company_id },
    );
  }

  const row = await createTenantRow(mapCreateTenantInputDtoToRowInput(input));

  if (!row) {
    throw new Error("Failed to create tenant.");
  }

  return mapTenantRowToDto(row);
}

export async function updateTenantById(
  tenantId: string | number,
  input: UpdateTenantInputDto,
): Promise<TenantDto> {
  const currentRow = await findTenantRowById(tenantId);

  if (!currentRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  if (Number(currentRow.tn_company_id) !== Number(input.tenant_company_id)) {
    throw new ApiError(
      "serviceDesk.tenants.companyMismatch",
      400,
      { companyId: input.tenant_company_id },
    );
  }

  const row = await updateTenantRowById(
    tenantId,
    mapUpdateTenantInputDtoToRowInput(input),
  );

  if (!row) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return mapTenantRowToDto(row);
}

export async function deactivateTenantById(
  tenantId: string | number,
): Promise<TenantDto> {
  const row = await deactivateTenantRowById(tenantId);

  if (!row) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return mapTenantRowToDto(row);
}
