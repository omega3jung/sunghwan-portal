import { LocalizedText } from "@/shared/types";

/** Defines the PostgreSQL job field row used only within the repository boundary. */
export interface JobFieldRow {
  jf_id: number;
  jf_name: LocalizedText;
  jf_description: LocalizedText | null;
  jf_department_id: number;
  jf_company_id: number;
  jf_parent_id: number | null;
  jf_active: boolean;
}
