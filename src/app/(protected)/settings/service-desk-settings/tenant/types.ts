import { Company } from "@/domain/organization";
import { Tenant } from "@/domain/serviceDesk";

export type CompanySettingItem = Company;

export type TenantSettingItem = Tenant & {
  code?: string;
  isPortalOwner?: boolean;
};
