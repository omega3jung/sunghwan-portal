import { TenantDto } from "./tenantDto";
import { TenantRow } from "./tenantRow";

export function mapTenantRowToDto(row: TenantRow): TenantDto {
  return {
    tenant_id: Number(row.tn_id),
    tenant_company_id: Number(row.tn_company_id),
    tenant_name: row.tn_name,
    tenant_color: row.tn_color,
  };
}

export function mapTenantRowsToDtos(rows: TenantRow[]): TenantDto[] {
  return rows.map(mapTenantRowToDto);
}
