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

/** Maps tenant row to dto across the database and API boundary. */
export function mapTenantRowToDto(row: TenantRow): TenantDto {
  return {
    tenant_id: Number(row.tn_id),
    tenant_company_id: Number(row.tn_company_id),
    tenant_name: row.tn_name,
    tenant_color: row.tn_color,
    tenant_active: row.tn_active,
  };
}

/** Maps tenant rows to dtos across the database and API boundary. */
export function mapTenantRowsToDtos(rows: TenantRow[]): TenantDto[] {
  return rows.map(mapTenantRowToDto);
}

/** Maps create tenant input dto to row input across the database and API boundary. */
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

/** Maps update tenant input dto to row input across the database and API boundary. */
export function mapUpdateTenantInputDtoToRowInput(
  input: UpdateTenantInputDto,
): UpdateTenantRowInput {
  return {
    tn_name: input.tenant_name,
    tn_color: input.tenant_color,
    tn_active: input.tenant_active ?? true,
  };
}
