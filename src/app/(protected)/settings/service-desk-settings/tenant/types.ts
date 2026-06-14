import { Company } from "@/domain/organization";
import { Tenant } from "@/domain/serviceDesk";
import { LocalizedText } from "@/shared/types";

export type CompanySettingItem = Company;

export type TenantSettingItem = Tenant & {
  name: LocalizedText;
  code?: string;
  active: boolean;
  isPortalOwner?: boolean;
};
