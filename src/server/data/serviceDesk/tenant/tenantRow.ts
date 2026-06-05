import { LocalizedText } from "@/shared/types";

export type TenantRow = {
  tn_id: number;
  tn_company_id: number;
  tn_name: LocalizedText;
  tn_color: string;
  tn_active: boolean;
  tn_created_at: string;
  tn_updated_at: string;
};
