import { CompanyDto } from "./companyDto";
import { CompanyRow } from "./companyRow";

/** Maps company row to dto across the database and API boundary. */
export function mapCompanyRowToDto(row: CompanyRow): CompanyDto {
  return {
    company_id: Number(row.c_id),
    company_name: row.c_name,
    company_code: row.c_code ?? undefined,
    company_portal_owner: row.c_portal_owner,
    company_active: row.c_active,
  };
}

/** Maps company rows to dtos across the database and API boundary. */
export function mapCompanyRowsToDtos(rows: CompanyRow[]): CompanyDto[] {
  return rows.map(mapCompanyRowToDto);
}
