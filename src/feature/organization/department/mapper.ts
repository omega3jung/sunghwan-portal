import { Department } from "@/domain/organization";
import { idToNumber, numberToId } from "@/lib/api/utils/mapId";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper, LocalizedText } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

// back-end data structures.
export interface DbDepartment {
  d_id: number;
  d_name: LocalizedText;
  d_code: string | null; // HR, IT, QC.
  d_description: LocalizedText | null;
  d_parent_id: number | null;
  d_active: boolean;
}

export const camelDepartmentMapper: ArrayMapper<DbDepartment, Department> = (
  data,
) => {
  return data.map((item) => ({
    id: item.d_id.toString(),
    name: item.d_name,
    code: nullToUndefined(item.d_code),
    description: nullToUndefined(item.d_description),
    parentId: numberToId(item.d_parent_id),
    active: item.d_active,
  }));
};

export const snakeDepartmentMapper: ArrayMapper<Department, DbDepartment> = (
  data,
) => {
  return data.map((item) => ({
    d_id: parseInt(item.id),
    d_name: item.name,
    d_code: undefinedToNull(item.code),
    d_description: undefinedToNull(item.description),
    d_parent_id: idToNumber(item.parentId),
    d_active: item.active,
  }));
};

export const mapDepartmentListPayload = createListPayloadMapper(
  camelDepartmentMapper,
);
export const mapDepartmentItemPayload = createItemPayloadMapper(
  camelDepartmentMapper,
);
