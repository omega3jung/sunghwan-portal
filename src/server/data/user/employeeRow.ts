import { LocalizedName } from "@/domain/organization";

export interface DbEmployeeRow {
  employee_id: number;
  employee_user_name: string;
  employee_name: LocalizedName;
  employee_phone: string;
  employee_email: string;
  employee_image_url: string | null;
  employee_department_id: number;
  employee_job_field_id: number;
  employee_company_id: number;
  employee_start_date: string;
  employee_end_date: string | null;
  employee_shift_id: number | null;
  employee_active: boolean;
  employee_engineer_id: number | null;
  employee_rf_tag_id: string | null;
  employee_hour_rate: number | null;
}
