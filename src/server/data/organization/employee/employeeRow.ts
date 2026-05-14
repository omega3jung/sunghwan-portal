import { LocalizedName } from "@/domain/organization";

export interface DbEmployeeRow {
  e_id: number;
  e_user_name: string;
  e_name: LocalizedName;
  e_phone: string;
  e_email: string;
  e_image_url: string | null;
  e_did: number;
  e_jfid: number;
  e_cid: number;
  e_start_date: string;
  e_end_date: string | null;
  e_wsid: number | null;
  e_active: boolean;
  e_engineer_id: number | null;
  e_rf_tag_id: string | null;
  e_hour_rate: number | null;
}
