import { idToNumber, numberToId } from "@/api/utils/mapId";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/api/utils/payload";
import { JobField } from "@/domain/organization";
import { ArrayMapper, LocalizedText } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/nullable";

// back-end data structures.
export interface DbJobField {
  job_field_id: number;
  job_field_name: LocalizedText;
  job_field_description: LocalizedText | null;
  job_field_department_id: number;
  job_field_parent_id: number | null;
  job_field_active: boolean;
}

export const camelJobFieldMapper: ArrayMapper<DbJobField, JobField> = (
  data,
) => {
  return data.map((item) => ({
    id: item.job_field_id.toString(),
    name: item.job_field_name,
    description: nullToUndefined(item.job_field_description),
    departmentId: item.job_field_department_id.toString(),
    parentId: numberToId(item.job_field_parent_id),
    active: item.job_field_active,
  }));
};

export const snakeJobFieldMapper: ArrayMapper<JobField, DbJobField> = (
  data,
) => {
  return data.map((item) => ({
    job_field_id: parseInt(item.id),
    job_field_name: item.name,
    job_field_description: undefinedToNull(item.description),
    job_field_department_id: parseInt(item.departmentId),
    job_field_parent_id: idToNumber(item.parentId),
    job_field_active: item.active,
  }));
};

export const mapJobFieldListPayload = createListPayloadMapper(
  camelJobFieldMapper,
);
export const mapJobFieldItemPayload = createItemPayloadMapper(
  camelJobFieldMapper,
);
