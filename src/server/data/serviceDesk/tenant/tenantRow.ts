import { LocalizedText } from "@/shared/types";

/** Defines the PostgreSQL tenant row used only within the repository boundary. */
export type TenantRow = {
  tn_id: number;
  tn_company_id: number;
  tn_name: LocalizedText;
  tn_color: string;
  tn_active: boolean;
};

/** Defines the PostgreSQL create tenant row input used only within the repository boundary. */
export type CreateTenantRowInput = {
  tn_company_id: number;
  tn_name: LocalizedText;
  tn_color: string;
  tn_active: boolean;
};

/** Defines the PostgreSQL update tenant row input used only within the repository boundary. */
export type UpdateTenantRowInput = {
  tn_name: LocalizedText;
  tn_color: string;
  tn_active: boolean;
};
