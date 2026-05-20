import { queryPortalApi } from "@/server/shared/supabase/portalApiClient";

import {
  GetUserPreferenceByKeyParams,
  SaveUserPreferenceByKeyInput,
} from "./userPreferenceDto";
import { UserPreferenceRow } from "./userPreferenceRow";

const FIND_USER_PREFERENCE_BY_PATH_QUERY = `
select ump_preference_key,
       ump_preference_meta
  from user_module_preference
 where ump_employee_username = $1
   and ump_preference_key = $2;
`;

const CREATE_USER_PREFERENCE_BY_KEY_QUERY = `
insert into user_module_preference (
  ump_employee_username,
  ump_module_id,
  ump_preference_key,
  ump_preference_meta
)
select
  $1,
  pm.pm_id,
  $3,
  $4::jsonb
from program_module pm
where pm.pm_key = $2
returning
  ump_preference_key,
  ump_preference_meta;
`;

const UPDATE_USER_PREFERENCE_BY_KEY_QUERY = `
update user_module_preference ump
set
  ump_preference_meta = $4::jsonb,
  ump_updated_at = now()
from program_module pm
where
  ump.ump_module_id = pm.pm_id
  and ump.ump_employee_username = $1
  and pm.pm_key = $2
  and ump.ump_preference_key = $3
returning
  ump.ump_preference_key,
  ump.ump_preference_meta;
`;

export async function findUserPreferenceByKey(
  params: GetUserPreferenceByKeyParams,
): Promise<UserPreferenceRow | null> {
  const { username, preferenceKey } = params;
  const rows = await queryPortalApi<UserPreferenceRow>(
    FIND_USER_PREFERENCE_BY_PATH_QUERY,
    [username, preferenceKey],
  );

  return rows[0] ?? null;
}

export async function insertUserPreferenceByKey(
  params: SaveUserPreferenceByKeyInput,
): Promise<UserPreferenceRow | null> {
  const { username, moduleKey, preferenceType, preferenceMeta } = params;
  const rows = await queryPortalApi<UserPreferenceRow>(
    CREATE_USER_PREFERENCE_BY_KEY_QUERY,
    [username, moduleKey, preferenceType, JSON.stringify(preferenceMeta)],
  );

  return rows[0] ?? null;
}

export async function patchUserPreferenceByKey(
  params: SaveUserPreferenceByKeyInput,
): Promise<UserPreferenceRow | null> {
  const { username, moduleKey, preferenceType, preferenceMeta } = params;
  const rows = await queryPortalApi<UserPreferenceRow>(
    UPDATE_USER_PREFERENCE_BY_KEY_QUERY,
    [username, moduleKey, preferenceType, JSON.stringify(preferenceMeta)],
  );

  return rows[0] ?? null;
}
