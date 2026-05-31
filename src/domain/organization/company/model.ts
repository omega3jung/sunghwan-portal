import { ISODateString } from "@/shared/types";
import { LocalizedText } from "@/shared/types/language";

export interface Company {
  id: string;

  // basic info
  name: LocalizedText;
  code?: string;

  // system
  createdAt: ISODateString;
  updatedAt: ISODateString;
  active: boolean;
}
