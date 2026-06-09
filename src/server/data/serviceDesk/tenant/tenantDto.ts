import { LocalizedText } from "@/shared/types";

export interface TenantDto {
  tenant_id: number;
  tenant_company_id: number;
  tenant_name: LocalizedText;
  tenant_color: string;
  tenant_active: boolean;
}

export interface CreateTenantInputDto {
  tenant_company_id: number;
  tenant_name: LocalizedText;
  tenant_color: string;
  tenant_active?: boolean;
}

export interface UpdateTenantInputDto {
  tenant_company_id: number;
  tenant_name: LocalizedText;
  tenant_color: string;
  tenant_active?: boolean;
}
