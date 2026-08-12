import { isOwnerCompany } from "@/domain/organization";
import { ApiError } from "@/lib/application/api";
import type { ServiceDeskSettingsTenantContext } from "@/lib/application/contracts/serviceDesk";
import { isOperationalServiceDeskTenant } from "@/lib/application/serviceDesk";
import { getActiveCompanies } from "@/server/data/organization/company";
import type { PortalApiQueryExecutor } from "@/server/shared/supabase/portalApiClient";

export type { ServiceDeskSettingsTenantContext } from "@/lib/application/contracts/serviceDesk";

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

/** Loads tenant by id through the server data boundary. */
export async function getTenantById(
  tenantId: string | number,
): Promise<TenantDto | null> {
  const row = await findTenantRowById(tenantId);

  if (!row) {
    return null;
  }

  return mapTenantRowToDto(row);
}

/** Loads tenants through the server data boundary. */
export async function getTenants(): Promise<TenantDto[]> {
  const rows = await findTenantRows();

  return mapTenantRowsToDtos(rows);
}

/** Loads active tenant by id through the server data boundary. */
export async function getActiveTenantById(
  tenantId: string | number,
  query?: PortalApiQueryExecutor,
): Promise<TenantDto | null> {
  const row = await findActiveTenantRowById(tenantId, query);

  if (!row) {
    return null;
  }

  return mapTenantRowToDto(row);
}

/** Loads active tenant by company id through the server data boundary. */
export async function getActiveTenantByCompanyId(
  companyId: string | number,
): Promise<TenantDto | null> {
  const row = await findActiveTenantRowByCompanyId(companyId);

  if (!row) {
    return null;
  }

  return mapTenantRowToDto(row);
}

/** Loads active tenants through the server data boundary. */
export async function getActiveTenants(): Promise<TenantDto[]> {
  const rows = await findActiveTenantRows();

  return mapTenantRowsToDtos(rows);
}

/** Loads service desk settings tenant contexts through the server data boundary. */
export async function getServiceDeskSettingsTenantContexts(): Promise<
  ServiceDeskSettingsTenantContext[]
> {
  const [tenants, activeCompanies] = await Promise.all([
    getTenants(),
    getActiveCompanies(),
  ]);
  const activeCompanyIds = new Set(
    activeCompanies.map((company) => String(company.company_id)),
  );

  return tenants.map((tenant) => ({
    id: String(tenant.tenant_id),
    companyId: Number(tenant.tenant_company_id),
    isOwnerTenant: isOwnerCompany(tenant.tenant_company_id),
    active: tenant.tenant_active,
    operational: isOperationalServiceDeskTenant(
      tenant.tenant_active,
      activeCompanyIds.has(String(tenant.tenant_company_id)),
    ),
  }));
}

/** Loads service desk settings tenant context through the server data boundary. */
export async function getServiceDeskSettingsTenantContext(
  tenantId: string | number,
) {
  return (
    (await getServiceDeskSettingsTenantContexts()).find(
      (tenant) => tenant.id === String(tenantId),
    ) ?? null
  );
}

/** Loads service desk settings tenant context by company id through the server data boundary. */
export async function getServiceDeskSettingsTenantContextByCompanyId(
  companyId: string | number,
) {
  return (
    (await getServiceDeskSettingsTenantContexts()).find(
      (tenant) => String(tenant.companyId) === String(companyId),
    ) ?? null
  );
}

/** Creates tenant through the server persistence boundary. */
export async function createTenant(
  input: CreateTenantInputDto,
): Promise<TenantDto> {
  const rows = await findTenantRows();
  const duplicateTenant = rows.find(
    (row) => Number(row.tn_company_id) === Number(input.tenant_company_id),
  );

  if (duplicateTenant) {
    throw new ApiError("serviceDesk.tenants.companyAlreadyAssigned", 409, {
      companyId: input.tenant_company_id,
    });
  }

  const row = await createTenantRow(mapCreateTenantInputDtoToRowInput(input));

  if (!row) {
    throw new Error("Failed to create tenant.");
  }

  return mapTenantRowToDto(row);
}

/** Updates tenant by id while preserving server-side validation and persistence rules. */
export async function updateTenantById(
  tenantId: string | number,
  input: UpdateTenantInputDto,
): Promise<TenantDto> {
  const currentRow = await findTenantRowById(tenantId);

  if (!currentRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  if (Number(currentRow.tn_company_id) !== Number(input.tenant_company_id)) {
    throw new ApiError("serviceDesk.tenants.companyMismatch", 400, {
      companyId: input.tenant_company_id,
    });
  }

  assertPortalOwnerTenantRemainsActive(
    currentRow.tn_company_id,
    input.tenant_active ?? true,
  );

  const row = await updateTenantRowById(
    tenantId,
    mapUpdateTenantInputDtoToRowInput(input),
  );

  if (!row) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return mapTenantRowToDto(row);
}

/** Removes or deactivates tenant by id through the server persistence boundary. */
export async function deactivateTenantById(
  tenantId: string | number,
): Promise<TenantDto> {
  const currentRow = await findTenantRowById(tenantId);

  if (!currentRow) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  assertPortalOwnerTenantRemainsActive(currentRow.tn_company_id, false);

  const row = await deactivateTenantRowById(tenantId);

  if (!row) {
    throw new ApiError("serviceDesk.common.notFound", 404);
  }

  return mapTenantRowToDto(row);
}

/** Preserves the provider tenant required by all PORTAL workflows. */
export function assertPortalOwnerTenantRemainsActive(
  companyId: string | number,
  active: boolean,
) {
  if (isOwnerCompany(companyId) && !active) {
    throw new ApiError("serviceDesk.tenants.portalOwnerProtected", 409);
  }
}
