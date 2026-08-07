import { LocalizedText } from "@/shared/types";

/** Defines the tenant dto exchanged across the server API boundary. */
export interface TenantDto {
  tenant_id: number;
  tenant_company_id: number;
  tenant_name: LocalizedText;
  tenant_color: string;
  tenant_active: boolean;
}

/** Defines the create tenant input dto exchanged across the server API boundary. */
export interface CreateTenantInputDto {
  tenant_company_id: number;
  tenant_name: LocalizedText;
  tenant_color: string;
  tenant_active?: boolean;
}

/** Defines the update tenant input dto exchanged across the server API boundary. */
export interface UpdateTenantInputDto {
  tenant_company_id: number;
  tenant_name: LocalizedText;
  tenant_color: string;
  tenant_active?: boolean;
}
