import { DepartmentDto } from "./departmentDto";
import { DepartmentRow } from "./departmentRow";

export function mapDepartmentRowToDto(row: DepartmentRow): DepartmentDto {
  return {
    d_id: Number(row.d_id),
    d_name: row.d_name,
    d_code: row.d_code,
    d_description: row.d_description,
    d_company_id: Number(row.d_company_id),
    d_parent_id: row.d_parent_id === null ? null : Number(row.d_parent_id),
    d_active: row.d_active,
  };
}

export function mapDepartmentRowsToDtos(rows: DepartmentRow[]): DepartmentDto[] {
  return rows.map(mapDepartmentRowToDto);
}
