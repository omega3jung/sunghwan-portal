import { LocalizedText } from "@/shared/types";

export type TenantRow = {
  tn_id: number;
  tn_company_id: number;
  tn_name: LocalizedText;
  tn_color: string;
  tn_active: boolean;
};

export type CreateTenantRowInput = {
  tn_company_id: number;
  tn_name: LocalizedText;
  tn_color: string;
  tn_active: boolean;
};

export type UpdateTenantRowInput = {
  tn_name: LocalizedText;
  tn_color: string;
  tn_active: boolean;
};
