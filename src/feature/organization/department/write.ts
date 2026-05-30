import { Department } from "@/domain/organization";
import { idToNumber } from "@/lib/api/utils/mapId";
import { undefinedToNull } from "@/shared/utils/value";

import { DbDepartment } from "./mapper";

type DepartmentWriteFields = Pick<
  Department,
  "name" | "code" | "description" | "parentId" | "active"
>;

type DbDepartmentWriteInput = Omit<DbDepartment, "d_id"> & {
  d_id?: number | null;
};

export type CreateDepartmentInput = DepartmentWriteFields & { id?: string };
export type UpdateDepartmentInput = DepartmentWriteFields & { id: string };

export function toDepartmentWritePayload(
  input: CreateDepartmentInput | UpdateDepartmentInput,
): DbDepartmentWriteInput {
  return {
    d_id: idToNumber(input.id),
    d_name: input.name,
    d_code: undefinedToNull(input.code),
    d_description: undefinedToNull(input.description),
    d_parent_id: idToNumber(input.parentId),
    d_active: input.active,
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
