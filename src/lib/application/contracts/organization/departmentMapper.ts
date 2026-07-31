import { Department } from "@/domain/organization";
import { idToNumber, numberToId } from "@/lib/application/api/mapId";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/application/api/payload";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

import { DbDepartment } from "./department";

/** Maps a database department record into the application-facing model. */
export const camelDepartmentMapper: ArrayMapper<DbDepartment, Department> = (
  data,
) => {
  return data.map((item) => ({
    id: item.d_id.toString(),
    name: item.d_name,
    code: nullToUndefined(item.d_code),
    description: nullToUndefined(item.d_description),
    companyId: item.d_company_id.toString(),
    parentId: numberToId(item.d_parent_id),
    active: item.d_active,
  }));
};

/** Maps an application department model into its database-facing shape. */
export const snakeDepartmentMapper: ArrayMapper<Department, DbDepartment> = (
  data,
) => {
  return data.map((item) => ({
    d_id: parseInt(item.id),
    d_name: item.name,
    d_code: undefinedToNull(item.code),
    d_description: undefinedToNull(item.description),
    d_company_id: parseInt(item.companyId),
    d_parent_id: idToNumber(item.parentId),
    d_active: item.active,
  }));
};

/** Maps a department collection payload into application models. */
export const mapDepartmentListPayload = createListPayloadMapper(
  camelDepartmentMapper,
);
/** Maps a department payload into the application model. */
export const mapDepartmentItemPayload = createItemPayloadMapper(
  camelDepartmentMapper,
);
