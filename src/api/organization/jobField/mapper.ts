import { JobField } from "@/domain/organization";
import { ArrayMapper, LocalizedText } from "@/shared/types";

// back-end data structures.
export interface DbJobField {
  job_field_id: string;
  job_field_name: LocalizedText;
  job_field_description?: LocalizedText;
  job_field_department_id: string;
  job_field_parent_id: string | null;
  job_field_active: boolean;
}

export const camelJobFieldMapper: ArrayMapper<DbJobField, JobField> = (
  data,
) => {
  return data.map((item) => ({
    id: item.job_field_id,
    name: item.job_field_name,
    description: item.job_field_description,
    departmentId: item.job_field_department_id,
    parentId: item.job_field_parent_id,
    active: item.job_field_active,
  }));
};

export const snakeJobFieldMapper: ArrayMapper<JobField, DbJobField> = (
  data,
) => {
  return data.map((item) => ({
    job_field_id: item.id,
    job_field_name: item.name,
    job_field_description: item.description,
    job_field_department_id: item.id,
    job_field_parent_id: item.parentId,
    job_field_active: item.active,
  }));
};
