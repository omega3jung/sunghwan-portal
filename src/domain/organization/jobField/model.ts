import { LocalizedText } from "@/shared/types/language";

export interface JobField {
  id: string;

  // basic info
  name: LocalizedText;
  description?: LocalizedText;

  // organization
  departmentId: string;
  parentId: string | null; // parent field id.

  // system
  active: boolean;
}
