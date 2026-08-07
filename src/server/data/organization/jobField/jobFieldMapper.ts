import { JobFieldDto } from "./jobFieldDto";
import { JobFieldRow } from "./jobFieldRow";

/** Maps job field row to dto across the database and API boundary. */
export function mapJobFieldRowToDto(row: JobFieldRow): JobFieldDto {
  return {
    jf_id: Number(row.jf_id),
    jf_name: row.jf_name,
    jf_description: row.jf_description,
    jf_department_id: Number(row.jf_department_id),
    jf_company_id: Number(row.jf_company_id),
    jf_parent_id: row.jf_parent_id === null ? null : Number(row.jf_parent_id),
    jf_active: row.jf_active,
  };
}

/** Maps job field rows to dtos across the database and API boundary. */
export function mapJobFieldRowsToDtos(rows: JobFieldRow[]): JobFieldDto[] {
  return rows.map(mapJobFieldRowToDto);
}
