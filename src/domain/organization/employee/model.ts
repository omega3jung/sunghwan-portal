import { Locale } from "@/shared/types/locale";

export type DisplayName = {
  first: string;
  middle?: string;
  last: string;
};

export type LocalizedName = {
  en: DisplayName;
} & Partial<Record<Exclude<Locale, "en">, DisplayName>>;

export interface Employee {
  id: number; // internal db pk
  username: string; // stable app identifier

  name: LocalizedName; // localized display source
  phone: string;
  email: string;
  imageUrl?: string;

  departmentId: string;
  jobFieldId: string;
  companyId: string;

  startDate: Date;
  endDate?: Date;
  shiftId?: string;

  active: boolean;
  engineerId?: string;
  rfTagId?: string;

  hourRate?: number;
}
