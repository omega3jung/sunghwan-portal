import { EmployeeResponseDto } from "./employeesDto";
import { DbEmployeeRow } from "./employeesRow";

export function toEmployeeResponseDto(row: DbEmployeeRow): EmployeeResponseDto {
  return {
    employeeId: row.e_id,
    userName: row.e_username,
    name: row.e_name,
    phone: row.e_phone,
    email: row.e_email,
    imageUrl: row.e_image_url,
    departmentId: row.e_department_id,
    jobFieldId: row.e_job_field_id,
    companyId: row.e_company_id,
    startDate: row.e_start_date,
    endDate: row.e_end_date,
    shiftId: row.e_work_shift_id,
    active: row.e_active,
    engineerId: row.e_engineer_id,
    rfTagId: row.e_rf_tag_id,
    hourRate: row.e_hour_rate,
  };
}

export function toEmployeesResponseDto(
  rows: DbEmployeeRow[],
): EmployeeResponseDto[] {
  return rows.map(toEmployeeResponseDto);
}
