import { ISODateString } from "@/shared/types";
import { LocalizedText } from "@/shared/types/language";

export interface DbCompany {
  company_id: number;

  // basic info
  company_name: LocalizedText;
  company_code?: string;

  // system
  company_created_at: ISODateString;
  company_updated_at: ISODateString;
  company_active: boolean;
}
