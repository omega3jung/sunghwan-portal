import { Locale } from "@/shared/types/locale";

type LocalizedName = {
  en: {
    first: string;
    middle?: string;
    last: string;
  };
} & Partial<
  Record<
    Exclude<Locale, "en">,
    {
      first: string;
      middle?: string;
      last: string;
    }
  >
>;

export interface Employee {
  id: string;

  // basic info
  name: LocalizedName;
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
