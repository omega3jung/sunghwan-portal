import { Department } from "@/domain/organization";
import { idToNumber, numberToId } from "@/lib/api/utils/mapId";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper, LocalizedText } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/nullable";

// back-end data structures.
export interface DbDepartment {
  department_id: number;
  department_name: LocalizedText;
  department_code: string | null; // HR, IT, QC.
  department_description: LocalizedText | null;
  department_parent_id: number | null;
  department_active: boolean;
}

export const camelDepartmentMapper: ArrayMapper<DbDepartment, Department> = (
  data,
) => {
  return data.map((item) => ({
    id: item.department_id.toString(),
    name: item.department_name,
    code: nullToUndefined(item.department_code),
    description: nullToUndefined(item.department_description),
    parentId: numberToId(item.department_parent_id),
    active: item.department_active,
  }));
};

export const snakeDepartmentMapper: ArrayMapper<Department, DbDepartment> = (
  data,
) => {
  return data.map((item) => ({
    department_id: parseInt(item.id),
    department_name: item.name,
    department_code: undefinedToNull(item.code),
    department_description: undefinedToNull(item.description),
    department_parent_id: idToNumber(item.parentId),
    department_active: item.active,
  }));
};

export const mapDepartmentListPayload = createListPayloadMapper(
  camelDepartmentMapper,
);
export const mapDepartmentItemPayload = createItemPayloadMapper(
  camelDepartmentMapper,
);
