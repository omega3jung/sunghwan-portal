import { LocalizedName } from "@/domain/organization";

export type UserProfileRow = {
  id: string;
  employee_id: number;
  username: string;
  display_name: LocalizedName;
  email: string | null;
  company_id: number;
};
