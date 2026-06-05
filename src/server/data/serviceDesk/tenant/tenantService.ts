import { TenantDto } from "./tenantDto";
import { mapTenantRowsToDtos,mapTenantRowToDto } from "./tenantMapper";
import {
  findActiveTenantRowById,
  findActiveTenantRows,
} from "./tenantRepository";

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
