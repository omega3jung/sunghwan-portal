import { Employee } from "@/domain/organization";
import { idToNumber, numberToId } from "@/lib/api/utils/mapId";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

import { DbEmployee } from "./types";

export const camelEmployeeMapper: ArrayMapper<DbEmployee, Employee> = (
  data,
) => {
  return data.map((item) => ({
    id: item.e_id,
    username: item.e_username,
    name: item.e_name,
    phone: item.e_phone,
    email: item.e_email,
    imageUrl: nullToUndefined(item.e_image_url),
    departmentId: item.e_department_id.toString(),
    jobFieldId: item.e_job_field_id.toString(),
    companyId: item.e_company_id.toString(),
    startDate: item.e_start_date,
    endDate: nullToUndefined(item.e_end_date),
    shiftId: numberToId(item.e_work_shift_id),
    active: item.e_active,
    engineerId: numberToId(item.e_engineer_id),
    rfTagId: nullToUndefined(item.e_rf_tag_id),
    hourRate: nullToUndefined(item.e_hour_rate),
  }));
};

export const snakeEmployeeMapper: ArrayMapper<Employee, DbEmployee> = (
  data,
) => {
  return data.map((item) => ({
    e_id: item.id,
    e_username: item.username,
    e_name: item.name,
    e_phone: item.phone,
    e_email: item.email,
    e_image_url: undefinedToNull(item.imageUrl),
    e_department_id: parseInt(item.departmentId),
    e_job_field_id: parseInt(item.jobFieldId),
    e_company_id: parseInt(item.companyId),
    e_start_date: item.startDate,
    e_end_date: undefinedToNull(item.endDate),
    e_work_shift_id: idToNumber(item.shiftId),
    e_active: item.active,
    e_engineer_id: idToNumber(item.engineerId),
    e_rf_tag_id: undefinedToNull(item.rfTagId),
    e_hour_rate: undefinedToNull(item.hourRate),
  }));
};

export const mapEmployeeListPayload =
  createListPayloadMapper(camelEmployeeMapper);
export const mapEmployeeItemPayload =
  createItemPayloadMapper(camelEmployeeMapper);
