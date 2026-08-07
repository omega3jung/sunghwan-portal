import { LocalizedText } from "@/shared/types/language";

/** Database-facing company shape used by the organization application boundary. */
export interface DbCompany {
  company_id: number;

  // basic info
  company_name: LocalizedText;
  company_code?: string;

  // ownership
  company_portal_owner: boolean;

  // system
  company_active: boolean;
}
