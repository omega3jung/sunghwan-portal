import { Company } from "@/domain/organization";
import { Tenant } from "@/domain/serviceDesk";

import { TENANT_LOCALES } from "./constants";

export type TenantLocaleKey = (typeof TENANT_LOCALES)[number]["key"];

export type TenantLocalizedText = Record<TenantLocaleKey, string>;

export type CompanySettingItem = Company;

export type TenantSettingItem = Tenant & {
  name: TenantLocalizedText;
  code?: string;
  active: boolean;
  isPortalOwner?: boolean;
};
