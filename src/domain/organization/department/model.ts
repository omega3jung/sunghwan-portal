import { LocalizedText } from "@/shared/types/language";

export interface Department {
  id: string;

  name: LocalizedText;
  code?: string; // HR, IT, QC.
  description?: LocalizedText;

  companyId: string;
  parentId?: string;

  active: boolean;
}
