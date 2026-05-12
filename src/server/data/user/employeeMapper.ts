import { EmployeeResponseDto } from "./employeeDto";
import { DbEmployeeRow } from "./employeeRow";

export function toEmployeeResponseDto(row: DbEmployeeRow): EmployeeResponseDto {
  return {
    employeeId: row.employee_id,
    username: row.employee_user_name,
    name: row.employee_name,
    phone: row.employee_phone,
    email: row.employee_email,
    imageUrl: row.employee_image_url,
    departmentId: row.employee_department_id,
    jobFieldId: row.employee_job_field_id,
    companyId: row.employee_company_id,
    startDate: row.employee_start_date,
    endDate: row.employee_end_date,
    shiftId: row.employee_shift_id,
    active: row.employee_active,
    engineerId: row.employee_engineer_id,
    rfTagId: row.employee_rf_tag_id,
    hourRate: row.employee_hour_rate,
  };
}
