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

/** Represents service desk settings tenant context within the Service Desk application boundary. */
export type ServiceDeskSettingsTenantContext = {
  id: string;
  companyId: number;
  isOwnerTenant: boolean;
  active: boolean;
  /** Effective runtime availability; stored tenant active remains unchanged. */
  operational: boolean;
};

/** Parameters that configure service desk tenant list behavior in the Service Desk application boundary. */
export type ServiceDeskTenantListParams = DbParams & {
  active?: boolean;
  settings?: boolean;
  context?: "settings";
  /** Client-only discriminator so settings tenant caches cannot cross principals. */
  settingsPrincipalKey?: string;
};
