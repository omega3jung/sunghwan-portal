import { ISODateString } from "@/shared/types";
import { LocalizedText } from "@/shared/types/language";

export interface WorkShift {
  id: string;

  name: LocalizedText;
  code?: string;
  startTime: Date;
  endTime: Date;

  createdAt: ISODateString;
  updatedAt: ISODateString;
  active: boolean;
}
