import { AccessLevel } from "@/domain/auth";
import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import { LeftMenuRow } from "./leftMenuRow";

const FIND_LEFT_MENU_ROWS_BY_ACCESS_LEVEL_QUERY = `
select *
  from (
    select
      pm_id,
      pm_parent_id,
      pm_i18n,
      pm_path,
      pm_icon,
      pm_type,
      pm_menu_area,
      pm_menu_order,
      get_access_level_from_role(mp_subject_key) as min_access_level
    from program_module
    join module_permission
      on pm_id = mp_module_id
    where pm_parent_id is not null
      and pm_menu_visible = true
      and mp_subject_type = 'ROLE'
  ) menu
where min_access_level <= $1
order by 
  pm_menu_area,
  coalesce(pm_parent_id, 0),
  pm_menu_order,
  pm_id;
`;

export async function findLeftMenuRowsByAccessLevel(
  userAccessLevel: AccessLevel,
): Promise<LeftMenuRow[]> {
  return queryPortalApi<LeftMenuRow>(
    FIND_LEFT_MENU_ROWS_BY_ACCESS_LEVEL_QUERY,
    [userAccessLevel],
  );
}
