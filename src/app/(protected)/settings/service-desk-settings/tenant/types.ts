import { Company } from "@/domain/organization";
import { Tenant } from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";

import { TENANT_LOCALES } from "./constants";

export type TenantLocaleKey = (typeof TENANT_LOCALES)[number]["key"];

export type CompanySettingItem = Company;

export type TenantSettingItem = Tenant & {
  name: LocalizedText;
  code?: string;
  active: boolean;
  isPortalOwner?: boolean;
};
