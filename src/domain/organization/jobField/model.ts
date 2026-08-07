import { LocalizedText } from "@/shared/types/language";

export interface JobField {
  id: string;

  name: LocalizedText;
  description?: LocalizedText;

  companyId: string;
  departmentId: string;
  parentId?: string; // parent field id.

  active: boolean;
}
