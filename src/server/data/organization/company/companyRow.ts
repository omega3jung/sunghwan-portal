import { LocalizedText } from "@/shared/types";

export interface CompanyRow {
  c_id: number;
  c_name: LocalizedText;
  c_code: string | null;
  c_portal_owner: boolean;
  c_active: boolean;
}
