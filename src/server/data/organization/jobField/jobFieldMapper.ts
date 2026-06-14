import { JobFieldDto } from "./jobFieldDto";
import { JobFieldRow } from "./jobFieldRow";

export function mapJobFieldRowToDto(row: JobFieldRow): JobFieldDto {
  return {
    jf_id: Number(row.jf_id),
    jf_name: row.jf_name,
    jf_description: row.jf_description,
    jf_department_id: Number(row.jf_department_id),
    jf_parent_id: row.jf_parent_id === null ? null : Number(row.jf_parent_id),
    jf_active: row.jf_active,
  };
}

export function mapJobFieldRowsToDtos(rows: JobFieldRow[]): JobFieldDto[] {
  return rows.map(mapJobFieldRowToDto);
}
