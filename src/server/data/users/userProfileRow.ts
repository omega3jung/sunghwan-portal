import { LocalizedName } from "@/domain/organization";

export type UserProfileRow = {
  aa_id: string;
  aa_username: string;
  e_username: string;
  e_name: LocalizedName;
  e_email: string | null;
  e_company_id: number;
};
