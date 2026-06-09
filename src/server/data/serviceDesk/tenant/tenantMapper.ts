import {
  CreateTenantInputDto,
  TenantDto,
  UpdateTenantInputDto,
} from "./tenantDto";
import {
  CreateTenantRowInput,
  TenantRow,
  UpdateTenantRowInput,
} from "./tenantRow";

export function mapTenantRowToDto(row: TenantRow): TenantDto {
  return {
    tenant_id: Number(row.tn_id),
    tenant_company_id: Number(row.tn_company_id),
    tenant_name: row.tn_name,
    tenant_color: row.tn_color,
    tenant_active: row.tn_active,
  };
}

export function mapTenantRowsToDtos(rows: TenantRow[]): TenantDto[] {
  return rows.map(mapTenantRowToDto);
}

export function mapCreateTenantInputDtoToRowInput(
  input: CreateTenantInputDto,
): CreateTenantRowInput {
  return {
    tn_company_id: Number(input.tenant_company_id),
    tn_name: input.tenant_name,
    tn_color: input.tenant_color,
    tn_active: input.tenant_active ?? true,
  };
}

export function mapUpdateTenantInputDtoToRowInput(
  input: UpdateTenantInputDto,
): UpdateTenantRowInput {
  return {
    tn_name: input.tenant_name,
    tn_color: input.tenant_color,
  };
}
