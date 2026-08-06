import { LocalizedText } from "@/shared/types";

export type Tenant = {
  id: string;
  companyId: string;
  name: LocalizedText;
  color: string;
  active: boolean;
};
