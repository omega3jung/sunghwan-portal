import { LocalizedText } from "@/shared/types";

export interface DepartmentRow {
  d_id: number;
  d_name: LocalizedText;
  d_code: string | null;
  d_description: LocalizedText | null;
  d_parent_id: number | null;
  d_active: boolean;
}
