import { LocalizedText } from "@/shared/types/language";

export interface Department {
  id: string;

  // basic info
  name: LocalizedText;
  code?: string; // HR, IT, QC.
  description?: LocalizedText;

  // organization
  parentId?: string;

  // system
  active: boolean;
}
