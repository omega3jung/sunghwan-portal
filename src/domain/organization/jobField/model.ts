import { LocalizedText } from "@/shared/types/language";

export interface jobField {
  id: string;

  // basic info
  name: LocalizedText;
  level: number; // AccessLevel.
  description?: string;

  // organization
  departmentId: string;

  // system
  active: boolean;
}
