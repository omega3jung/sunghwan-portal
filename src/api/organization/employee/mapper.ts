import { idToNumber, numberToId } from "@/api/utils/mapId";
import {
  createItemPayloadMapper,
  createListPayloadMapper,
} from "@/api/utils/payload";
import { Employee, LocalizedName } from "@/domain/organization";
import { ArrayMapper } from "@/shared/types";
import { nullToUndefined, undefinedToNull } from "@/shared/utils/nullable";

// back-end data structures.
export interface DbEmployee {
  employee_id: number;
  employee_name: LocalizedName;
  employee_phone: string;
  employee_email: string;
  employee_image_url: string | null;
  employee_department_id: number;
  employee_job_field_id: number;
  employee_company_id: number;
  employee_start_date: Date;
  employee_end_date: Date | null;
  employee_shift_id: number | null;
  employee_active: boolean;
  employee_engineer_id: number | null;
  employee_rf_tag_id: string | null;
  employee_hour_rate: number | null;
}

export const camelEmployeeMapper: ArrayMapper<DbEmployee, Employee> = (
  data,
) => {
  return data.map((item) => ({
    id: item.employee_id.toString(),
    name: item.employee_name,
    phone: item.employee_phone,
    email: item.employee_email,
    imageUrl: nullToUndefined(item.employee_image_url),
    departmentId: item.employee_department_id.toString(),
    jobFieldId: item.employee_job_field_id.toString(),
    companyId: item.employee_company_id.toString(),
    startDate: item.employee_start_date,
    endDate: nullToUndefined(item.employee_end_date),
    shiftId: numberToId(item.employee_shift_id),
    active: item.employee_active,
    engineerId: numberToId(item.employee_engineer_id),
    rfTagId: nullToUndefined(item.employee_rf_tag_id),
    hourRate: nullToUndefined(item.employee_hour_rate),
  }));
};

export const snakeEmployeeMapper: ArrayMapper<Employee, DbEmployee> = (
  data,
) => {
  return data.map((item) => ({
    employee_id: parseInt(item.id),
    employee_name: item.name,
    employee_phone: item.phone,
    employee_email: item.email,
    employee_image_url: undefinedToNull(item.imageUrl),
    employee_department_id: parseInt(item.departmentId),
    employee_job_field_id: parseInt(item.jobFieldId),
    employee_company_id: parseInt(item.companyId),
    employee_start_date: item.startDate,
    employee_end_date: undefinedToNull(item.endDate),
    employee_shift_id: idToNumber(item.shiftId),
    employee_active: item.active,
    employee_engineer_id: idToNumber(item.engineerId),
    employee_rf_tag_id: undefinedToNull(item.rfTagId),
    employee_hour_rate: undefinedToNull(item.hourRate),
  }));
};

export const mapEmployeeListPayload = createListPayloadMapper(
  camelEmployeeMapper,
);
export const mapEmployeeItemPayload = createItemPayloadMapper(
  camelEmployeeMapper,
);
