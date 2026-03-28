import { idToNumber } from "@/api/utils/mapId";
import { Department } from "@/domain/organization";
import { undefinedToNull } from "@/shared/utils/nullable";

import { DbDepartment } from "./mapper";

type DepartmentWriteFields = Pick<
  Department,
  "name" | "code" | "description" | "parentId" | "active"
>;

type DbDepartmentWriteInput = Omit<DbDepartment, "department_id"> & {
  department_id?: number | null;
};

export type CreateDepartmentInput = DepartmentWriteFields & { id?: string };
export type UpdateDepartmentInput = DepartmentWriteFields & { id: string };

export function toDepartmentWritePayload(
  input: CreateDepartmentInput | UpdateDepartmentInput,
): DbDepartmentWriteInput {
  return {
    department_id: idToNumber(input.id),
    department_name: input.name,
    department_code: undefinedToNull(input.code),
    department_description: undefinedToNull(input.description),
    department_parent_id: idToNumber(input.parentId),
    department_active: input.active,
  };
}

export function toDepartmentMockResource(
  input: CreateDepartmentInput | UpdateDepartmentInput,
  id = createMockId(),
): Department {
  return { id, ...input };
}

function createMockId() {
  return Date.now().toString();
}
