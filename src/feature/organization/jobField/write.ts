import { JobField } from "@/domain/organization";
import { idToNumber } from "@/lib/api/utils/mapId";
import { undefinedToNull } from "@/shared/utils/value";

import { DbJobField } from "./mapper";

type JobFieldWriteFields = Pick<
  JobField,
  "name" | "description" | "departmentId" | "parentId" | "active"
>;

type DbJobFieldWriteInput = Omit<DbJobField, "job_field_id"> & {
  job_field_id?: number | null;
};

export type CreateJobFieldInput = JobFieldWriteFields & { id?: string };
export type UpdateJobFieldInput = JobFieldWriteFields & { id: string };

export function toJobFieldWritePayload(
  input: CreateJobFieldInput | UpdateJobFieldInput,
): DbJobFieldWriteInput {
  return {
    job_field_id: idToNumber(input.id),
    job_field_name: input.name,
    job_field_description: undefinedToNull(input.description),
    job_field_department_id: Number(input.departmentId),
    job_field_parent_id: idToNumber(input.parentId),
    job_field_active: input.active,
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
