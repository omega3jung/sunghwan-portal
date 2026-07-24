import { JobField } from "@/domain/organization";
import { idToNumber } from "@/lib/application/api/mapId";
import { undefinedToNull } from "@/shared/utils/value";

import { DbJobField } from "./types";

type JobFieldWriteFields = Pick<
  JobField,
  "name" | "description" | "companyId" | "departmentId" | "parentId" | "active"
>;

type DbJobFieldWriteInput = Omit<DbJobField, "jf_id"> & {
  jf_id?: number | null;
};

export type CreateJobFieldInput = JobFieldWriteFields & { id?: string };
export type UpdateJobFieldInput = JobFieldWriteFields & { id: string };

export function toJobFieldWritePayload(
  input: CreateJobFieldInput | UpdateJobFieldInput,
): DbJobFieldWriteInput {
  return {
    jf_id: idToNumber(input.id),
    jf_name: input.name,
    jf_description: undefinedToNull(input.description),
    jf_department_id: Number(input.departmentId),
    jf_company_id: Number(input.companyId),
    jf_parent_id: idToNumber(input.parentId),
    jf_active: input.active,
  };
}

export function toJobFieldMockResource(
  input: CreateJobFieldInput | UpdateJobFieldInput,
  id = createMockId(),
): JobField {
  return { id, ...input };
}

function createMockId() {
  return Date.now().toString();
}
