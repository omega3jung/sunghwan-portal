import { LocalizedText } from "@/shared/types";

// tenant data structure.
export type Tenant = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string;
};
