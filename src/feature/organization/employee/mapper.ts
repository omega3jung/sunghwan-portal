import { Employee, LocalizedName } from "@/domain/organization";
import { idToNumber, numberToId } from "@/lib/api/utils/mapId";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/lib/api/utils/payload";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/value";

// back-end data structures.
export interface DbEmployee {
  e_id: number;
  e_username: string;
  e_name: LocalizedName;
  e_phone: string;
  e_email: string;
  e_image_url: string | null;
  e_department_id: number;
  e_job_field_id: number;
  e_company_id: number;
  e_start_date: Date;
  e_end_date: Date | null;
  e_work_shift_id: number | null;
  e_active: boolean;
  e_engineer_id: number | null;
  e_rf_tag_id: string | null;
  e_hour_rate: number | null;
}

export const camelEmployeeMapper: ArrayMapper<DbEmployee, Employee> = (
  data,
) => {
  return data.map((item) => ({
    id: item.e_id,
    userName: item.e_username,
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
    e_username: item.userName,
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
