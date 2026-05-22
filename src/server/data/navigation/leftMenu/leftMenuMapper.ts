import { LeftMenuDto } from "./leftMenuDto";
import { LeftMenuRow } from "./leftMenuRow";

export function mapLeftMenuRowToDto(row: LeftMenuRow): LeftMenuDto {
  return {
    id: Number(row.pm_id),
    parentId: row.pm_parent_id === null ? null : Number(row.pm_parent_id),
    title: row.pm_i18n,
    path: row.pm_path,
    icon: row.pm_icon,
    type: row.pm_type,
    area: row.pm_menu_area,
    order: row.pm_menu_order,
    minAccessLevel: row.min_access_level,
  };
}

export function mapLeftMenuRowsToDtos(rows: LeftMenuRow[]): LeftMenuDto[] {
  return rows.map(mapLeftMenuRowToDto);
}
