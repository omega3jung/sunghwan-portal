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
  userName: string; // stable app identifier

  // basic info
  name: LocalizedName; // localized display source
  phone: string;
  email: string;
  imageUrl?: string;

  // organization
  departmentId: string;
  jobFieldId: string;
  companyId: string;

  // employment
  startDate: Date;
  endDate?: Date;
  shiftId?: string;

  // system
  active: boolean;
  engineerId?: string;
  rfTagId?: string;

  // financial
  hourRate?: number;
}
