import { ISODateString } from "@/shared/types";
import { LocalizedText } from "@/shared/types/language";

export interface WorkShift {
  id: string;

  // basic info
  name: LocalizedText;
  code?: string;
  startTime: Date;
  endTime: Date;

  // system
  createdAt: ISODateString;
  updatedAt: ISODateString;
  active: boolean;
}
