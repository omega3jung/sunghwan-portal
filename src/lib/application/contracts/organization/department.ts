import { LocalizedText } from "@/shared/types";

// back-end data structures.
export interface DbDepartment {
  d_id: number;
  d_name: LocalizedText;
  d_code: string | null; // HR, IT, QC.
  d_description: LocalizedText | null;
  d_company_id: number;
  d_parent_id: number | null;
  d_active: boolean;
}
