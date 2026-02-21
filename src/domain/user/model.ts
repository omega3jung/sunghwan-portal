import { Locale } from "@/domain/config";

import { AccessLevel, Role } from "../auth/constants";
import { UserScope } from "../auth/types";

// user type for app.
export interface AppUser {
  id: string;
  username: string; // user account
  displayName: string; // user name
  email: string | null;
  image?: string;

  userScope: UserScope;
  tenantId: string | null;

  permission: AccessLevel;
  role: Role | null;

  canUseSuperUser: boolean | null; // from server.
  canUseImpersonation: boolean | null; // from server.
}

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
  phone: string;
  email: string;
  address1: string;
  address2: string;
  department: string;
  departmentId: string;
  jobField: string;
  jobFieldId: string;
  shift: { from: Date; to: Date };
  active: boolean;
  name: LocalizedName;
  startDate: Date;
  endDate: Date;
  company: string;
  companyId: string;
  imageUrl: string;
  hourRate: number;
  engineerId: string;
  passToken: string;
  client: string;
  clientId: string;
}
