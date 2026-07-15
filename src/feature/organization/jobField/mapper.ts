import { JobField } from "@/domain/organization";
import { idToNumber, numberToId } from "@/lib/api/utils/mapId";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

import { DbJobField } from "./types";

export const camelJobFieldMapper: ArrayMapper<DbJobField, JobField> = (
  data,
) => {
  return data.map((item) => ({
    id: item.jf_id.toString(),
    name: item.jf_name,
    description: nullToUndefined(item.jf_description),
    departmentId: item.jf_department_id.toString(),
    companyId: item.jf_company_id.toString(),
    parentId: numberToId(item.jf_parent_id),
    active: item.jf_active,
  }));
};

export const snakeJobFieldMapper: ArrayMapper<JobField, DbJobField> = (
  data,
) => {
  return data.map((item) => ({
    jf_id: parseInt(item.id),
    jf_name: item.name,
    jf_description: undefinedToNull(item.description),
    jf_department_id: parseInt(item.departmentId),
    jf_company_id: parseInt(item.companyId),
    jf_parent_id: idToNumber(item.parentId),
    jf_active: item.active,
  }));
};

export const mapJobFieldListPayload =
  createListPayloadMapper(camelJobFieldMapper);
export const mapJobFieldItemPayload =
  createItemPayloadMapper(camelJobFieldMapper);
