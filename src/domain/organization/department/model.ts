import { LocalizedText } from "@/shared/types/language";

export interface Department {
  id: string;

  // basic info
  name: LocalizedText;
  code?: string; // HR, IT, QC.
  description?: string;

  // organization
  parentId: string;

  // system
  active: boolean;
}
