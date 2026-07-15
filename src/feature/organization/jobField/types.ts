import { LocalizedText } from "@/shared/types";

// back-end data structures.
export interface DbJobField {
  jf_id: number;
  jf_name: LocalizedText;
  jf_description: LocalizedText | null;
  jf_department_id: number;
  jf_company_id: number;
  jf_parent_id: number | null;
  jf_active: boolean;
}
