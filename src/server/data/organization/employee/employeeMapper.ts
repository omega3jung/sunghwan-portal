import { EmployeeResponseDto } from "./employeeDto";
import { DbEmployeeRow } from "./employeeRow";

export function toEmployeeResponseDto(row: DbEmployeeRow): EmployeeResponseDto {
  return {
    employeeId: row.e_id,
    username: row.e_user_name,
    name: row.e_name,
    phone: row.e_phone,
    email: row.e_email,
    imageUrl: row.e_image_url,
    departmentId: row.e_did,
    jobFieldId: row.e_jfid,
    companyId: row.e_cid,
    startDate: row.e_start_date,
    endDate: row.e_end_date,
    shiftId: row.e_wsid,
    active: row.e_active,
    engineerId: row.e_engineer_id,
    rfTagId: row.e_rf_tag_id,
    hourRate: row.e_hour_rate,
  };
}
