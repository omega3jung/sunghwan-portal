import { Employee, LocalizedName } from "@/domain/organization";
import { ArrayMapper } from "@/shared/types";

// back-end data structures.
export interface DbEmployee {
  employee_id: string;
  employee_name: LocalizedName;
  employee_phone: string;
  employee_email: string;
  employee_image_url?: string;
  employee_department_id: string;
  employee_job_field_id: string;
  employee_company_id: string;
  employee_start_date: Date;
  employee_end_date?: Date;
  employee_shift_id?: string;
  employee_active: boolean;
  employee_engineer_id?: string;
  employee_rf_tag_id?: string;
  employee_hour_rate?: number;
}

export const camelEmployeeMapper: ArrayMapper<DbEmployee, Employee> = (
  data,
) => {
  return data.map((item) => ({
    id: item.employee_id,
    name: item.employee_name,
    phone: item.employee_phone,
    email: item.employee_email,
    imageUrl: item.employee_image_url,
    departmentId: item.employee_department_id,
    jobFieldId: item.employee_job_field_id,
    companyId: item.employee_company_id,
    startDate: item.employee_start_date,
    endDate: item.employee_end_date,
    shiftId: item.employee_shift_id,
    active: item.employee_active,
    engineerId: item.employee_engineer_id,
    rfTagId: item.employee_rf_tag_id,
    hourRate: item.employee_hour_rate,
  }));
};

export const snakeEmployeeMapper: ArrayMapper<Employee, DbEmployee> = (
  data,
) => {
  return data.map((item) => ({
    employee_id: item.id,
    employee_name: item.name,
    employee_phone: item.phone,
    employee_email: item.email,
    employee_image_url: item.imageUrl,
    employee_department_id: item.departmentId,
    employee_job_field_id: item.jobFieldId,
    employee_company_id: item.companyId,
    employee_start_date: item.startDate,
    employee_end_date: item.endDate,
    employee_shift_id: item.shiftId,
    employee_active: item.active,
    employee_engineer_id: item.engineerId,
    employee_rf_tag_id: item.rfTagId,
    employee_hour_rate: item.hourRate,
  }));
};
