import { LocalizedText } from "@/shared/types";
import type { DbParams } from "@/shared/types/api";

// back-end data structures.
export type DbTenant = {
  tenant_id: number;
  tenant_company_id: number;
  tenant_name: LocalizedText;
  tenant_color: string;
  tenant_active?: boolean;
};

export type ServiceDeskTenantListParams = DbParams & {
  active?: boolean;
};
