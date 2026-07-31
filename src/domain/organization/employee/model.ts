import { Locale } from "@/shared/types/locale";

/** Represents display name within the organization domain. */
export type DisplayName = {
  first: string;
  middle?: string;
  last: string;
};

/** Represents localized name within the organization domain. */
export type LocalizedName = {
  en: DisplayName;
} & Partial<Record<Exclude<Locale, "en">, DisplayName>>;

/** Represents employee within the organization domain. */
export interface Employee {
  id: number; // internal db pk
  username: string; // stable app identifier

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
