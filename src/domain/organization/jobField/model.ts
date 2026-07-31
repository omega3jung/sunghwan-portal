import { LocalizedText } from "@/shared/types/language";

/** Represents job field within the organization domain. */
export interface JobField {
  id: string;

  // basic info
  name: LocalizedText;
  description?: LocalizedText;

  // organization
  companyId: string;
  departmentId: string;
  parentId?: string; // parent field id.

  // system
  active: boolean;
}
