import { LocalizedText } from "@/shared/types";

// back-end data structures.
export type DbTenant = {
  tenant_id: number;
  tenant_company_id: number;
  tenant_name: LocalizedText;
  tenant_color: string;
};
