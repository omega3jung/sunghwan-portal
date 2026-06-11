import { ServiceDeskApiError } from "@/app/api/service-desk/_shared/messages";

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

export async function getActiveTenants(): Promise<TenantDto[]> {
  const rows = await findActiveTenantRows();

  return mapTenantRowsToDtos(rows);
}

export async function createTenant(
  input: CreateTenantInputDto,
): Promise<TenantDto> {
  const rows = await findTenantRows();
  const duplicateTenant = rows.find(
    (row) => Number(row.tn_company_id) === Number(input.tenant_company_id),
  );

  if (duplicateTenant) {
    throw new ServiceDeskApiError(
      "api.tenants.localDemo.companyAlreadyAssigned",
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
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  if (Number(currentRow.tn_company_id) !== Number(input.tenant_company_id)) {
    throw new ServiceDeskApiError(
      "api.tenants.localDemo.companyMismatch",
      400,
      { companyId: input.tenant_company_id },
    );
  }

  const row = await updateTenantRowById(
    tenantId,
    mapUpdateTenantInputDtoToRowInput(input),
  );

  if (!row) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  return mapTenantRowToDto(row);
}

export async function deactivateTenantById(
  tenantId: string | number,
): Promise<TenantDto> {
  const row = await deactivateTenantRowById(tenantId);

  if (!row) {
    throw new ServiceDeskApiError("api.common.notFound", 404);
  }

  return mapTenantRowToDto(row);
}
