import { LocalizedName } from "@/domain/organization";

export interface DbEmployeeRow {
  e_id: number;
  e_username: string;
  e_name: LocalizedName;
  e_phone: string;
  e_email: string;
  e_image_url: string | null;
  e_department_id: number;
  e_job_field_id: number;
  e_company_id: number;
  e_start_date: string;
  e_end_date: string | null;
  e_work_shift_id: number | null;
  e_active: boolean;
  e_engineer_id: number | null;
  e_rf_tag_id: string | null;
  e_hour_rate: number | null;
}
